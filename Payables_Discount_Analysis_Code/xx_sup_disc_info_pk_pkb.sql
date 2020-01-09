
REM +=========================================================================+
REM |                             Pavan Boyapati                              |
REM |                           COlumbus Ohio, USA                            |
REM +=========================================================================+
REM |                                                                         |
REM | FILENAME                                                                |
REM |    XX_SUP_DISC_INFO_PK.sql                                              |
REM |                                                                         |
REM | DESCRIPTION                                                             |
REM |    PLSQL package body to fetch xml type output for Discount Analytics   |
REM |    and Audit.                                                           |
REM |                                                                         |
REM | HISTORY                                                                 |
REM | 24-Feb-2015          Pavan Boyapati                  Initial version.   |
REM +=========================================================================+

CREATE OR REPLACE PACKAGE BODY APPS.xx_sup_disc_info_pk
AS
   g_date      DATE := NULL;
   g_no_days   NUMBER := 0;
   g_top_n     NUMBER := 0;

   PROCEDURE xx_main_proc (x_errbuf       OUT VARCHAR2,
                           x_retcode      OUT NUMBER,
                           p_as_of_date       VARCHAR2,
                           p_no_days          NUMBER,
                           p_top_n            NUMBER)
   IS
      l_result   XMLTYPE;
   BEGIN
      g_date := TRUNC (fnd_date.canonical_to_date (p_as_of_date));
      g_no_days := p_no_days;
      g_top_n := p_top_n;

      FND_FILE.put_line (
         FND_FILE.LOG,
         'XML Generating Started ..................................');


      SELECT XMLELEMENT (
                "DISC_MAIN",
                XMLELEMENT ("PARAMETERS",
                            XMLELEMENT ("AS_OF_DATE", p_as_of_date),
                            XMLELEMENT ("NO_OF_DAYS", p_no_days),
                            XMLELEMENT ("TOPN_ROWS", p_top_n)),
                XMLELEMENT (
                   "DISC_ANALYTICS",
                   XMLELEMENT ("SUPP_VOL", supplier_dtls (g_date)),
                   XMLELEMENT ("INV_VOL", invoice_dtls (g_date)),
                   XMLELEMENT ("MANUAL_INV_VOL", manual_inv_dtls (g_date)),
                   XMLELEMENT ("HOLD_VOL", hold_dtls (g_date)),
                   XMLELEMENT ("SUPP_DISCNT_LOST_DTLS",
                               supplier_lost_discnt (g_date)),
                   XMLELEMENT ("INV_DISCNT_LOST_DTLS",
                               INVOICE_LOST_DISCNT (G_DATE))),
                xmlelement (
                   "DISC_AUDIT",
                   xmlelement ("PAYBL_PRODUCT_OPTNS",
                               PRODUCT_SETUP_OPTIONS (G_DATE)),
                   xmlelement ("PAYBL_OPT_DTLS",
                               PAYBL_SETUP_OPTIONS (G_DATE)),
                   xmlelement ("PMT_TERM_OPTNS", PMT_TERM_DTLS (G_DATE)),
                   XMLELEMENT ("SUPP_OPTNS", supplier_optns (g_date)),
                   XMLELEMENT ("SUPPLIER_IMM_PAY_TERMS", supplier_imm_pay_terms (g_date))))
        INTO l_result
        FROM DUAL;

      dbms_output.put_line(l_result.getclobval);

      FND_FILE.put_line (
         FND_FILE.LOG,
         'XML Generating End ..................................');
   EXCEPTION
      WHEN OTHERS
      then
      dbms_output.put_line( 'Error in XX_MAIN_PROG: ' || SQLERRM);
         FND_FILE.PUT_LINE (FND_FILE.LOG,
                            'Error in XX_MAIN_PROG: ' || SQLERRM);
   END xx_main_proc;


   --==========================================================================
   -- To fetch top N supplier details
   --==========================================================================
   PROCEDURE before_report (p_date DATE)
   IS
      --  v_date             DATE := fnd_date.canonical_to_date (p_date);
      v_date   DATE := p_date;
   BEGIN
      FND_FILE.PUT_LINE (
         FND_FILE.LOG,
         'In Before Report to fetch Top ' || g_top_n || ' Supplier Details: ');

        SELECT vendor_id
          BULK COLLECT INTO v_topn_supp
          FROM (  SELECT api.vendor_id,
                         segment1,
                         Vendor_name,
                         SUM (Invoice_amount) inv_total_amt
                    FROM ap_invoices_all api, ap_suppliers aps
                   WHERE     api.vendor_id = aps.vendor_id
                         AND invoice_type_lookup_code = 'STANDARD'
                         AND api.creation_date > g_date - g_no_days
                GROUP BY api.vendor_id, segment1, Vendor_name
                ORDER BY SUM (invoice_amount) DESC)
         WHERE ROWNUM < g_top_n
      ORDER BY inv_total_amt DESC;

      FND_FILE.PUT_LINE (FND_FILE.OUTPUT,
                         'Top ' || g_top_n || ' Supplier Details: ');

      FOR i IN 1 .. v_topn_supp.COUNT
      LOOP
         FND_FILE.PUT_LINE (FND_FILE.OUTPUT, i || '.' || v_topn_supp (i));
      --         DBMS_OUTPUT.put_line (v_topn_supp (i));
      END LOOP;

      FND_FILE.PUT_LINE (FND_FILE.LOG, 'End of Before Report.');
   EXCEPTION
      WHEN OTHERS
      THEN
         FND_FILE.PUT_LINE (FND_FILE.LOG,
                            'Error in BEFORE_REPORT: ' || SQLERRM);
   END;

   --==========================================================================
   -- To fetch supplier analytics
   --==========================================================================
   FUNCTION supplier_dtls (p_date DATE)
      RETURN XMLTYPE
   IS
      v_supplier_dtls    XMLTYPE;

      --      v_date             DATE := fnd_date.canonical_to_date (p_date);
      v_date             DATE := p_date;
      v_error            VARCHAR2 (32767) := NULL;
      v_vendor_cnt       NUMBER := 0;
      v_vend_enbl_cnt    NUMBER := 0;
      v_vend_cnt_1inv    NUMBER := 0;
      v_nemp_vend_1inv   NUMBER := 0;
   BEGIN
      FND_FILE.PUT_LINE (FND_FILE.LOG,
                         'In Supplier Dtls to fetch Supplier Analytics: ');

      --Supplier Count
      BEGIN
         SELECT COUNT (1) INTO v_vendor_cnt FROM ap_suppliers;
      EXCEPTION
         WHEN OTHERS
         THEN
            v_error :=
               v_error || 'Error while fetching supplier count' || SQLERRM;
      END;

      --Supplier Count with Enabled Flag
      BEGIN
         SELECT COUNT (1)
           INTO v_vend_enbl_cnt
           FROM ap_suppliers
          WHERE     ENABLED_FLAG = 'Y'
                AND START_DATE_ACTIVE <= SYSDATE
                AND (END_DATE_ACTIVE IS NULL OR END_DATE_ACTIVE >= SYSDATE);
      EXCEPTION
         WHEN OTHERS
         THEN
            v_error :=
                  v_error
               || 'Error while fetching supplier enabled count'
               || SQLERRM;
      END;

      --Suppliers with atleast one Invoice in last 365 days
      BEGIN
         SELECT COUNT (1)
           INTO v_vend_cnt_1inv
           FROM ap_suppliers aps
          WHERE EXISTS
                   (SELECT 1
                      FROM ap_Invoices_all apinv
                     WHERE     aps.vendor_id = apinv.vendor_id
                           AND apinv.creation_date >
                                  TRUNC (g_date - g_no_days));
      EXCEPTION
         WHEN OTHERS
         THEN
            v_error :=
                  v_error
               || 'Error while fetching supplier count with at least one Invoice in last '
               || g_no_days
               || ' days'
               || SQLERRM;
      END;

      --Non-Employee Suppliers with atleast one Invoice in last 365 days
      BEGIN
         SELECT COUNT (1)
           INTO v_nemp_vend_1inv
           FROM ap_suppliers aps
          WHERE     vendor_type_lookup_code <> 'EMPLOYEE'
                AND EXISTS
                       (SELECT 1
                          FROM ap_Invoices_all apinv
                         WHERE     aps.vendor_id = apinv.vendor_id
                               AND apinv.creation_date >
                                      TRUNC (g_date - g_no_days));
      EXCEPTION
         WHEN OTHERS
         THEN
            v_error :=
                  v_error
               || 'Error while fetching non employee supplier count with at least one Invoice in last '
               || g_no_days
               || ' days'
               || SQLERRM;
      END;


      SELECT XMLCONCAT (XMLELEMENT ("VENDOR_CNT", v_vendor_cnt),
                        XMLELEMENT ("VEND_ENBL_CNT", v_vend_enbl_cnt),
                        XMLELEMENT ("VEND_CNT_1INV", v_vend_cnt_1inv),
                        XMLELEMENT ("NEMP_VEND_1INV", v_nemp_vend_1inv))
        INTO v_supplier_dtls
        FROM DUAL;

      FND_FILE.PUT_LINE (FND_FILE.LOG, 'End of Supplier Dtls');

      RETURN v_supplier_dtls;
   EXCEPTION
      WHEN OTHERS
      THEN
         v_error := 'Error in supplier_dtls: ' || SQLERRM;
         FND_FILE.PUT_LINE (FND_FILE.log, V_ERROR);
         return(null);
   END supplier_dtls;

   --==========================================================================
   -- To fetch invoice analytics
   --==========================================================================
   FUNCTION invoice_dtls (p_date DATE)
      RETURN XMLTYPE
   IS
      v_invoice_dtls   XMLTYPE;

      --      v_date           DATE := fnd_date.canonical_to_date (p_date);
      v_date           DATE := p_date;
      v_error          VARCHAR2 (32767) := NULL;
      v_inv_cnt        NUMBER;
      v_inv_cnt_365    NUMBER;
      v_inv_cnt_180    NUMBER;
      v_inv_cnt_90     NUMBER;
      v_inv_cnt_30     NUMBER;
      v_inv_cnt_avg    NUMBER;
   BEGIN
      FND_FILE.PUT_LINE (FND_FILE.LOG,
                         'In Invoice Dtls, to fetch Invoice Analytics');

      --Total Invoices
      BEGIN
         SELECT COUNT (1) INTO v_inv_cnt FROM ap_invoices_all;
      EXCEPTION
         WHEN OTHERS
         THEN
            v_error :=
                  v_error
               || 'Error while fetching total Invoice Count: '
               || SQLERRM;
      END;

      --Invoices in last N days
      BEGIN
         SELECT COUNT (1)
           INTO v_inv_cnt_365
           FROM AP_invoices_all
          WHERE creation_date > TRUNC (g_date - 365);
      EXCEPTION
         WHEN OTHERS
         THEN
            v_error :=
                  v_error
               || 'Error while fetching Invoice Count 365: '
               || SQLERRM;
      END;

      --Invoices in last 180 days
      BEGIN
         SELECT COUNT (1)
           INTO v_inv_cnt_180
           FROM AP_invoices_all
          WHERE creation_date > TRUNC (g_date - 180);
      EXCEPTION
         WHEN OTHERS
         THEN
            v_error :=
                  v_error
               || 'Error while fetching Invoice Count 180: '
               || SQLERRM;
      END;

      --Invoices in last 90 days
      BEGIN
         SELECT COUNT (1)
           INTO v_inv_cnt_90
           FROM AP_invoices_all
          WHERE creation_date > TRUNC (g_date - 90);
      EXCEPTION
         WHEN OTHERS
         THEN
            v_error :=
                  v_error
               || 'Error while fetching Invoice Count 90: '
               || SQLERRM;
      END;

      --Invoices in last 30 days
      BEGIN
         SELECT COUNT (1)
           INTO v_inv_cnt_30
           FROM AP_invoices_all
          WHERE creation_date > TRUNC (g_date - 30);
      EXCEPTION
         WHEN OTHERS
         THEN
            v_error :=
                  v_error
               || 'Error while fetching Invoice Count 30: '
               || SQLERRM;
      END;

      --Invoices average per day
      BEGIN
         SELECT ROUND (  (SELECT COUNT (1)
                            FROM AP_invoices_all
                           WHERE creation_date > TRUNC (g_date - 365))
                       / 365)
           INTO v_inv_cnt_avg
           FROM DUAL;
      EXCEPTION
         WHEN OTHERS
         THEN
            v_error :=
                  v_error
               || 'Error while fetching Invoice average count per day: '
               || SQLERRM;
      END;

      SELECT XMLCONCAT (XMLELEMENT ("INV_CNT", v_inv_cnt),
                        XMLELEMENT ("INV_CNT_365", v_inv_cnt_365),
                        XMLELEMENT ("INV_CNT_180", v_inv_cnt_180),
                        XMLELEMENT ("INV_CNT_90", v_inv_cnt_90),
                        XMLELEMENT ("INV_CNT_30", v_inv_cnt_30),
                        XMLELEMENT ("INV_CNT_AVG", v_inv_cnt_avg))
        INTO v_invoice_dtls
        FROM DUAL;

      FND_FILE.PUT_LINE (FND_FILE.LOG, 'End ofInvoice Dtls');

      RETURN v_invoice_dtls;
   EXCEPTION
      WHEN OTHERS
      THEN
         FND_FILE.PUT_LINE (FND_FILE.LOG,
                            'Error in invoice_dtls: ' || SQLERRM);
        return(null);                            
   END invoice_dtls;

   --==========================================================================
   -- To fetch manual invoice analytics
   --==========================================================================
   FUNCTION manual_inv_dtls (p_date DATE)
      RETURN XMLTYPE
   IS
      v_manual_inv_dtls   XMLTYPE;

      --      v_date           DATE := fnd_date.canonical_to_date (p_date);
      v_date              DATE := p_date;
      v_error             VARCHAR2 (32767) := NULL;
      v_m_inv_cnt         NUMBER;
      v_m_inv_cnt_365     NUMBER;
      v_m_inv_cnt_180     NUMBER;
      v_m_inv_cnt_90      NUMBER;
      v_m_inv_cnt_30      NUMBER;
      v_m_inv_cnt_avg     NUMBER;
   BEGIN
      FND_FILE.PUT_LINE (
         FND_FILE.LOG,
         'In Manual Inv Dtls, to fetch Manual Invoice Analytics');

      --Total Manual Invoices
      BEGIN
         SELECT COUNT (1)
           INTO v_m_inv_cnt
           FROM AP_invoices_all
          WHERE UPPER (source) = 'MANUAL INVOICE ENTRY';
      EXCEPTION
         WHEN OTHERS
         THEN
            v_error :=
               v_error || 'Error while fetching Manual Invoice: ' || SQLERRM;
      END;

      --Manual Invoices in last 365 days
      BEGIN
         SELECT COUNT (1)
           INTO v_m_inv_cnt_365
           FROM AP_invoices_all
          WHERE     creation_date > TRUNC (g_date - 365)
                AND UPPER (source) = 'MANUAL INVOICE ENTRY';
      EXCEPTION
         WHEN OTHERS
         THEN
            v_error :=
                  v_error
               || 'Error while fetching Manual Invoice count 365: '
               || SQLERRM;
      END;

      --Manual Invoices in last 180 days
      BEGIN
         SELECT COUNT (1)
           INTO v_m_inv_cnt_180
           FROM AP_invoices_all
          WHERE     creation_date > TRUNC (g_date - 180)
                AND UPPER (source) = 'MANUAL INVOICE ENTRY';
      EXCEPTION
         WHEN OTHERS
         THEN
            v_error :=
                  v_error
               || 'Error while fetching Manual Invoice count 180: '
               || SQLERRM;
      END;

      --Manual Invoices in last 90 days
      BEGIN
         SELECT COUNT (1)
           INTO v_m_inv_cnt_90
           FROM AP_invoices_all
          WHERE     creation_date > TRUNC (g_date - 90)
                AND UPPER (source) = 'MANUAL INVOICE ENTRY';
      EXCEPTION
         WHEN OTHERS
         THEN
            v_error :=
                  v_error
               || 'Error while fetching Manual Invoice count 90: '
               || SQLERRM;
      END;


      --Manual Invoices in last 30 days
      BEGIN
         SELECT COUNT (1)
           INTO v_m_inv_cnt_30
           FROM AP_invoices_all
          WHERE     creation_date > TRUNC (g_date - 30)
                AND UPPER (source) = 'MANUAL INVOICE ENTRY';
      EXCEPTION
         WHEN OTHERS
         THEN
            v_error :=
                  v_error
               || 'Error while fetching Manual Invoice count 30: '
               || SQLERRM;
      END;


      --Average Manual invoices per day
      BEGIN
         SELECT ROUND (
                     (SELECT COUNT (1)
                        FROM AP_invoices_all
                       WHERE     UPPER (source) = 'MANUAL INVOICE ENTRY'
                             AND creation_date > TRUNC (g_date - 365))
                   / 365)
           INTO v_m_inv_cnt_avg
           FROM DUAL;
      EXCEPTION
         WHEN OTHERS
         THEN
            v_error :=
                  v_error
               || 'Error while fetching Manual Invoice average count per day: '
               || SQLERRM;
      END;

      SELECT XMLCONCAT (XMLELEMENT ("MINV_CNT", v_m_inv_cnt),
                        XMLELEMENT ("MINV_CNT_365", v_m_inv_cnt_365),
                        XMLELEMENT ("MINV_CNT_180", v_m_inv_cnt_180),
                        XMLELEMENT ("MINV_CNT_90", v_m_inv_cnt_90),
                        XMLELEMENT ("MINV_CNT_30", v_m_inv_cnt_30),
                        XMLELEMENT ("MINV_CNT_AVG", v_m_inv_cnt_avg))
        INTO v_manual_inv_dtls
        FROM DUAL;

      FND_FILE.PUT_LINE (FND_FILE.LOG, 'End of Manual Invoice Dtls');

      RETURN v_manual_inv_dtls;
   EXCEPTION
      WHEN OTHERS
      THEN
         FND_FILE.PUT_LINE (FND_FILE.LOG,
                            'Error in manual_invoice_dtls: ' || SQLERRM);
         return(null);                   
   END manual_inv_dtls;

   --==========================================================================
   -- To fetch Hold Analytics
   --==========================================================================
   FUNCTION hold_dtls (p_date DATE)
      RETURN XMLTYPE
   IS
      v_hold_details   XMLTYPE;

      --      v_date           DATE := fnd_date.canonical_to_date (p_date);
      v_date           DATE := p_date;
   BEGIN
      FND_FILE.PUT_LINE (FND_FILE.LOG,
                         'In Hold dtsl to fetch Hold Analytics');

      SELECT XMLCONCAT (
                XMLAGG (
                   XMLELEMENT ("HOLD_TYPE",
                               XMLELEMENT ("HOLD_NAME", hold.meaning),
                               XMLELEMENT ("HOLD_COUNT", hold.cnt))))
        INTO v_hold_details
        FROM (  SELECT flvv.meaning, COUNT (1) cnt
                  FROM ap_holds_all aha, fnd_lookup_values_vl flvv
                 WHERE     1 = 1
                       AND flvv.lookup_code = aha.hold_lookup_code
                       AND flvv.lookup_type = 'HOLD CODE'
                       AND hold_date > TRUNC (g_date - 365)
              GROUP BY flvv.meaning
              ORDER BY COUNT (1) DESC) hold;

      FND_FILE.PUT_LINE (FND_FILE.LOG, 'End of Hold Dtls');

      RETURN v_hold_details;
   EXCEPTION
      WHEN OTHERS
      THEN
         FND_FILE.PUT_LINE (FND_FILE.log, 'Error in hold_dtls: ' || SQLERRM);
         return(null);
   END hold_dtls;

   --==========================================================================
   -- To fetch Supplier Lost Discount
   --==========================================================================
   FUNCTION supplier_lost_discnt (p_date DATE)
      RETURN XMLTYPE
   IS
      v_supp_lost_discnt   XMLTYPE;
      --      v_date           DATE := fnd_date.canonical_to_date (p_date);
      v_date               DATE := p_date;
   BEGIN
      FND_FILE.PUT_LINE (
         FND_FILE.LOG,
         'In supplier_lost_discnt to fetch Supplier Loss Details');

      SELECT XMLCONCAT (
                XMLAGG (XMLELEMENT ("SUPP_DISCNT",
                                    XMLELEMENT ("VENDOR_NAME", vendor_name),
                                    XMLELEMENT ("VENDOR_NUM", vendor_num),
                                    XMLELEMENT ("DISC_SUM", disc_sum))))
        INTO v_supp_lost_discnt
        FROM (  SELECT vendor_name, vendor_num, disc_sum
                  FROM (  SELECT aps.vendor_name,
                                 aps.segment1 vendor_num,
                                 SUM (discount_lost) disc_sum
                            FROM ap_invoice_payments_all apip,
                                 ap_invoices_all api,
                                 ap_suppliers aps
                           WHERE     apip.invoice_id = api.invoice_id
                                 AND api.vendor_id = aps.vendor_id
                                 AND NVL (discount_lost, 0) <> 0
                                 AND NVL (discount_lost, 0) <>
                                        (-1) * NVL (discount_taken, 0)
                                 AND apip.creation_date >
                                        TRUNC (g_date - g_no_days)
                        GROUP BY aps.vendor_name, aps.segment1
                        ORDER BY SUM (discount_lost) DESC)
                 WHERE ROWNUM < 11
              ORDER BY Disc_sum DESC);

      FND_FILE.PUT_LINE (FND_FILE.LOG, 'End of supplier_lost_discnt');

      RETURN v_supp_lost_discnt;
   EXCEPTION
      WHEN OTHERS
      THEN
         FND_FILE.PUT_LINE (FND_FILE.LOG,
                            'Error in supplier_lost_discnt' || SQLERRM);
         return(null);                   
   END supplier_lost_discnt;

      --==========================================================================
   -- To fetch Supplier Immediate Payment Terms
   --==========================================================================
   FUNCTION supplier_imm_pay_terms (p_date DATE)
      RETURN XMLTYPE
   IS
      v_supp_lost_discnt   XMLTYPE;
      --      v_date           DATE := fnd_date.canonical_to_date (p_date);
      v_date               DATE := p_date;
   BEGIN
      FND_FILE.PUT_LINE (
         FND_FILE.LOG,
         'In supplier_imm_pay_terms to fetch Supplier Loss Details');

      SELECT XMLCONCAT (
                XMLAGG (XMLELEMENT ("SUPP_IMME_PAY_TERM",
                                    XMLELEMENT ("VENDOR_NAME", vendor_name),
                                    XMLELEMENT ("VENDOR_NUM", vendor_num),
                                    XMLELEMENT ("INV_AMT", inv_amt))))
        INTO v_supp_lost_discnt
        FROM (  SELECT vendor_name, vendor_num, inv_amt
                  FROM (  SELECT aps.vendor_name,
                                 aps.segment1 vendor_num,
                                 SUM (invoice_amount) inv_amt
                            FROM ap_invoices_all api,
								 ap_terms_vl apt,
                                 ap_suppliers aps
                           WHERE     api.vendor_id = aps.vendor_id
						         AND api.terms_id = apt.term_id								 
                     AND apt.name = 'Immediate'
                                 AND api.creation_date >
                                        TRUNC (g_date - g_no_days)
                        GROUP BY aps.vendor_name, aps.segment1
                        ORDER BY SUM (invoice_amount) DESC)
                 WHERE ROWNUM < g_top_n
              ORDER BY inv_amt DESC);

      FND_FILE.PUT_LINE (FND_FILE.LOG, 'End of supplier_imm_pay_terms');

      RETURN v_supp_lost_discnt;
   EXCEPTION
      WHEN OTHERS
      THEN
         FND_FILE.PUT_LINE (FND_FILE.LOG,
                            'Error in supplier_imm_pay_terms' || SQLERRM);
        return(null);                            
   END supplier_imm_pay_terms;


   --==========================================================================
   -- To fetch Invoice Lost Discount
   --==========================================================================
   FUNCTION invoice_lost_discnt (p_date DATE)
      RETURN XMLTYPE
   IS
      v_inv_lost_discnt   XMLTYPE;
      --      v_date           DATE := fnd_date.canonical_to_date (p_date);
      v_date              DATE := p_date;
   BEGIN
      FND_FILE.PUT_LINE (
         FND_FILE.LOG,
         'In invoice_lost_discnt, to fetch Invoice Lost Details');

      SELECT XMLCONCAT (
                XMLAGG (XMLELEMENT ("INV_DISCNT",
                                    XMLELEMENT ("INVOICE_NUM", invoice_num),
                                    XMLELEMENT ("VENDOR_NAME", vendor_name),
                                    XMLELEMENT ("VENDOR_NUM", vendor_num),
                                    XMLELEMENT ("TERM_NAME", term_name),
                                    XMLELEMENT ("DISC_SUM", disc_sum))))
        INTO v_inv_lost_discnt
        FROM (  SELECT Invoice_num,
                       vendor_name,
                       vendor_num,
                       term_name,
                       disc_sum
                  FROM (  SELECT api.invoice_num,
                                 aps.vendor_name,
                                 aps.segment1 vendor_num,
                                 atv.name term_name,
                                 SUM (discount_lost) disc_sum
                            FROM ap_invoice_payments_all apip,
                                 ap_invoices_all api,
                                 ap_suppliers aps,
                                 ap_terms_vl atv
                           WHERE     apip.invoice_id = api.invoice_id
                                 AND api.vendor_id = aps.vendor_id
                                 AND api.terms_id = atv.term_id
                                 AND apip.creation_date >
                                        TRUNC (g_date - g_no_days)
                                 AND NVL (discount_lost, 0) <> 0
                                 AND NVL (discount_lost, 0) <>
                                        (-1) * NVL (discount_taken, 0)
                        GROUP BY api.Invoice_num,
                                 aps.vendor_name,
                                 aps.segment1,
                                 atv.name
                        ORDER BY SUM (discount_lost) DESC)
                 WHERE ROWNUM < 11
              ORDER BY Disc_sum DESC);

      FND_FILE.PUT_LINE (FND_FILE.LOG, 'End of invoice_lost_discnt');

      RETURN v_inv_lost_discnt;
   EXCEPTION
      WHEN OTHERS
      THEN
         FND_FILE.PUT_LINE (FND_FILE.LOG,
                            'Error in invoice_lost_discnt: ' || SQLERRM);
        return(null);
   END invoice_lost_discnt;

   --==========================================================================
   -- To fetch Payable Setup Options
   --==========================================================================
   FUNCTION Paybl_setup_options (p_date DATE)
      RETURN XMLTYPE
   IS
      v_paybl_options_dtls   XMLTYPE;

      --      v_date           DATE := fnd_date.canonical_to_date (p_date);
      v_date                 DATE := p_date;
   BEGIN
      FND_FILE.PUT_LINE (
         FND_FILE.LOG,
         'In Paybl_setup_options, to fetch Payable Setup Option Details');

      SELECT XMLCONCAT (
                XMLAGG (
                   XMLELEMENT (
                      "PAYBL_OPTS",
                      XMLELEMENT ("ORG_NAME", org_name),
                      XMLELEMENT ("VENDOR_PAY_GROUP",
                                  vendor_pay_group_lookup_code),
                      XMLELEMENT ("PAY_DATE_BASIS",
                                  pay_date_basis_lookup_code),
                      XMLELEMENT ("TERMS_DATE_BASIS", terms_date_basis),
                      XMLELEMENT ("TERM_NAME", TERM_NAME))))
        INTO v_paybl_options_dtls
        FROM (  SELECT hou.name org_name,
                       aspa.vendor_pay_group_lookup_code,
                       aspa.pay_date_basis_lookup_code,
                       aspa.terms_date_basis,
                       atv.name term_name
                  FROM ap_system_parameters_all aspa,
                       hr_operating_units hou,
                       ap_terms_vl atv
                 WHERE     1 = 1
                       AND atv.term_id(+) = aspa.terms_id
                       AND hou.organization_id = aspa.org_id
              ORDER BY 1) paybl_optns;

      FND_FILE.PUT_LINE (FND_FILE.LOG, 'End of Paybl_setup_options');

      RETURN v_paybl_options_dtls;
   EXCEPTION
      WHEN OTHERS
      THEN
         FND_FILE.PUT_LINE (FND_FILE.LOG,
                            'Error in Paybl_setup_options: ' || SQLERRM);
          return(null);                  
   END Paybl_setup_options;

   --==========================================================================
   -- To fetch Product Setup Options
   --==========================================================================
   FUNCTION Product_setup_options (p_date DATE)
      RETURN XMLTYPE
   IS
      v_product_stp   XMLTYPE;

      --      v_date           DATE := fnd_date.canonical_to_date (p_date);
      v_date          DATE := p_date;
   BEGIN
      FND_FILE.PUT_LINE (FND_FILE.LOG, 'Start of Product_setup_options');

      SELECT XMLCONCAT (
                XMLELEMENT ("VENDOR_PAY_GROUP",
                            supplier_pay_group_lookup_code),
                XMLELEMENT ("PAY_DATE_BASIS", pay_date_basis_lookup_code),
                XMLELEMENT ("TERMS_DATE_BASIS", terms_date_basis),
                XMLELEMENT ("TERM_NAME", terms_name),
                XMLELEMENT ("ALWAYS_TAKE_DISC_FLAG", always_take_disc_flag))
        INTO v_product_stp
        FROM (SELECT aps.supplier_pay_group_lookup_code,
                     aps.pay_date_basis_lookup_code,
                     aps.terms_date_basis,
                     atv.name terms_name,
                     aps.always_take_disc_flag
                FROM ap_product_setup aps, ap_terms_vl atv
               WHERE 1 = 1 AND aps.terms_id = atv.term_id(+));

      FND_FILE.PUT_LINE (FND_FILE.LOG, 'End of Product_setup_options');
      RETURN v_product_stp;
   EXCEPTION
      WHEN OTHERS
      THEN
         FND_FILE.PUT_LINE (FND_FILE.LOG,
                            'Error in Product_setup_options: ' || SQLERRM);
         return(null);                   
   END Product_setup_options;

   --==========================================================================
   -- To fetch Payment term details
   --==========================================================================
   FUNCTION pmt_term_dtls (p_date DATE)
      RETURN XMLTYPE
   IS
      v_pmt_term_dtls   XMLTYPE;
      --      v_date           DATE := fnd_date.canonical_to_date (p_date);
      v_date            DATE := p_date;
   BEGIN
      FND_FILE.PUT_LINE (FND_FILE.LOG, 'start of pmt_term_dtls');

      SELECT XMLCONCAT (
                XMLAGG (
                   XMLELEMENT (
                      "PMT_TRM",
                      XMLELEMENT ("PAY_TERM", name),
                      XMLELEMENT ("PAY_DESCRIPTION", description),
                      XMLELEMENT ("DUE_PERCENT", due_percent),
                      XMLELEMENT ("DUE_AMOUNT", due_amount),
                      XMLELEMENT ("DUE_DAYS", due_days),
                      XMLELEMENT ("DUE_DAY_OF_MONTH", due_day_of_month),
                      XMLELEMENT ("DUE_MONTHS_FORWARD", due_months_forward),
                      XMLELEMENT ("DISCOUNT_PERCENT", discount_percent),
                      XMLELEMENT ("DISCOUNT_AMOUNT", discount_amount),
                      XMLELEMENT ("DISCOUNT_DAYS", discount_days),
                      XMLELEMENT ("DISCOUNT_DAY_OF_MONTH",
                                  discount_day_of_month),
                      XMLELEMENT ("DISCOUNT_MONTHS_FORWARD",
                                  discount_months_forward),
                      XMLELEMENT ("DISCOUNT_PERCENT_2", discount_percent_2),
                      XMLELEMENT ("DISCOUNT_AMOUNT_2", discount_amount_2),
                      XMLELEMENT ("DISCOUNT_DAYS_2", discount_days_2),
                      XMLELEMENT ("DISCOUNT_DAY_OF_MONTH_2",
                                  discount_day_of_month_2),
                      XMLELEMENT ("DISCOUNT_MONTHS_FORWARD_2",
                                  discount_months_forward_2),
                      XMLELEMENT ("DISCOUNT_PERCENT_3", discount_percent_3),
                      XMLELEMENT ("DISCOUNT_AMOUNT_3", discount_amount_3),
                      XMLELEMENT ("DISCOUNT_DAYS_3", discount_days_3),
                      XMLELEMENT ("DISCOUNT_DAY_OF_MONTH_3",
                                  discount_day_of_month_3),
                      XMLELEMENT ("DISCOUNT_MONTHS_FORWARD_3",
                                  discount_months_forward_3))))
        INTO v_pmt_term_dtls
        FROM (  SELECT apt.name,
                       apt.description,
                       aptl.due_percent,
                       due_amount,
                       Due_days,
                       Due_day_of_month,
                       Due_months_forward,
                       aptl.discount_percent,
                       aptl.discount_amount,
                       aptl.discount_days,
                       aptl.discount_day_of_month,
                       aptl.discount_months_forward,
                       aptl.discount_percent_2,
                       aptl.discount_amount_2,
                       aptl.discount_days_2,
                       aptl.discount_day_of_month_2,
                       aptl.discount_months_forward_2,
                       aptl.discount_percent_3,
                       aptl.discount_amount_3,
                       aptl.discount_days_3,
                       aptl.discount_day_of_month_3,
                       aptl.discount_months_forward_3
                  FROM ap_terms_vl apt, ap_terms_lines aptl
                 WHERE     apt.term_id = aptl.term_id
                       AND (   discount_percent IS NOT NULL
                            OR discount_amount IS NOT NULL)
              ORDER BY 1) pmt_trm;

      FND_FILE.PUT_LINE (FND_FILE.LOG, 'End of pmt_term_dtls');

      RETURN v_pmt_term_dtls;
   EXCEPTION
      WHEN OTHERS
      THEN
         FND_FILE.PUT_LINE (FND_FILE.LOG,
                            'Error in pmt_term_dtls: ' || SQLERRM);
          return(null);                  
   END pmt_term_dtls;

   --==========================================================================
   -- To fetch Supplier Options
   --==========================================================================
   FUNCTION supplier_optns (p_date DATE)
      RETURN XMLTYPE
   IS
      v_supp_optns   XMLTYPE;

      --      v_date           DATE := fnd_date.canonical_to_date (p_date);
      v_date         DATE := p_date;
   BEGIN
      FND_FILE.PUT_LINE (FND_FILE.LOG, 'Start of supplier_optns');

      SELECT XMLCONCAT (
                XMLELEMENT (
                   "SUPP_TOPN_OPTS",
                   XMLAGG (
                      XMLELEMENT (
                         "SUPP_OPTS",
                         XMLELEMENT ("VENDOR_NAME", vendor_name),
                         XMLELEMENT ("VENDOR_NO", segment1),
                         XMLELEMENT ("VENDOR_PAY_GROUP",
                                     pay_group_lookup_code),
                         XMLELEMENT ("PAY_DATE_BASIS",
                                     pay_date_basis_lookup_code),
                         XMLELEMENT ("TERMS_DATE_BASIS", terms_date_basis),
                         XMLELEMENT ("TERM_NAME", terms_name),
                         XMLELEMENT ("ALWAYS_TAKE_DISC_FLAG",
                                     always_take_disc_flag),
                         XMLELEMENT ("EXCLUDE_FREIGHT_FROM_DISC",
                                     exclude_freight_from_discount),
                         XMLELEMENT (
                            "SUPP_SITES",
                            (SELECT XMLAGG (
                                       XMLELEMENT (
                                          "SUPP_SITE",
                                          XMLELEMENT ("VENDOR_SITE_CODE",
                                                      vendor_site_code),
                                          XMLELEMENT (
                                             "ADDRESS",
                                                address_line1
                                             || ' , '
                                             || apss.city
                                             || ' , '
                                             || apss.state
                                             || ' , '
                                             || apss.country),
                                          XMLELEMENT ("PAY_SITE_FLAG",
                                                      Pay_site_flag),
                                          XMLELEMENT ("VENDOR_PAY_GROUP",
                                                      pay_group_lookup_code),
                                          XMLELEMENT (
                                             "PAY_DATE_BASIS",
                                             pay_date_basis_lookup_code),
                                          XMLELEMENT ("TERMS_DATE_BASIS",
                                                      terms_date_basis),
                                          XMLELEMENT ("TERM_NAME", name),
                                          XMLELEMENT (
                                             "ALWAYS_TAKE_DISC_FLAG",
                                             always_take_disc_flag),
                                          XMLELEMENT (
                                             "EXCLUDE_FREIGHT_FROM_DISC",
                                             exclude_freight_from_discount)))
                               FROM ap_supplier_sites_all apss,
                                    ap_terms_vl atvs
                              WHERE     1 = 1
                                    AND apsup.vendor_id = apss.vendor_id
                                    AND apss.terms_id = atvs.term_id(+)
                                    AND apss.pay_site_flag = 'Y'
                                    AND (   apss.inactive_date IS NULL
                                         OR apss.inactive_date > SYSDATE)))))))
        INTO v_supp_optns
        FROM (SELECT aps.pay_group_lookup_code,
                     aps.pay_date_basis_lookup_code,
                     aps.terms_date_basis,
                     aps.always_take_disc_flag,
                     atv.name terms_name,
                     aps.exclude_freight_from_discount,
                     aps.segment1,
                     aps.vendor_name,
                     aps.vendor_id vendor_id
                FROM ap_suppliers aps, ap_terms_vl atv
               WHERE     1 = 1
                     AND aps.terms_id = atv.term_id(+)
                     /*AND aps.vendor_id IN (SELECT vendor_id
                                             FROM (  SELECT api.vendor_id,
                                                            segment1,
                                                            Vendor_name,
                                                            SUM (
                                                               Invoice_amount)
                                                               inv_total_amt
                                                       FROM ap_invoices_all api,
                                                            ap_suppliers aps
                                                      WHERE     api.vendor_id =
                                                                   aps.vendor_id
                                                            AND invoice_type_lookup_code =
                                                                   'STANDARD'
                                                            AND api.creation_date >
                                                                     g_date
                                                                   - g_no_days
                                                   GROUP BY api.vendor_id,
                                                            segment1,
                                                            Vendor_name
                                                   ORDER BY SUM (
                                                               invoice_amount) DESC)
                                            WHERE ROWNUM < g_top_n)*/
							AND aps.vendor_id IN (SELECT vendor_id FROM TABLE (v_topn_supp))
             ) apsup;

      FND_FILE.PUT_LINE (FND_FILE.LOG, 'End of Supplier_optns');

      RETURN v_supp_optns;
   EXCEPTION
      WHEN OTHERS
      THEN
         FND_FILE.PUT_LINE (FND_FILE.LOG,
                            'Error in supplier_optns: ' || SQLERRM);
         return(null);                   
   END supplier_optns;
end XX_SUP_DISC_INFO_PK;
/