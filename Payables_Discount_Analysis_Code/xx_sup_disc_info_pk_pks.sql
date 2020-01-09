create or replace
PACKAGE xx_sup_disc_info_pk
AS

    type topn_supp is table of number;
    v_topn_supp  topn_supp;
    
   PROCEDURE xx_main_proc (x_errbuf OUT VARCHAR2, x_retcode  OUT NUMBER, p_as_of_date VARCHAR2, p_no_days NUMBER, p_top_n  NUMBER );
    
    PROCEDURE before_report (p_date DATE);

   FUNCTION supplier_dtls (p_date DATE)
      RETURN XMLTYPE;

   FUNCTION invoice_dtls (p_date DATE)
      RETURN XMLTYPE;

   FUNCTION manual_inv_dtls (p_date DATE)
      RETURN XMLTYPE;
      
   FUNCTION hold_dtls (p_date DATE)
      RETURN XMLTYPE;  
      
   FUNCTION supplier_lost_discnt (p_date DATE)
      RETURN XMLTYPE;
      
   FUNCTION invoice_lost_discnt (p_date DATE)
      RETURN XMLTYPE;    

   FUNCTION paybl_setup_options (p_date DATE)
      RETURN XMLTYPE;

   FUNCTION product_setup_options (p_date DATE)
      RETURN XMLTYPE;
      
   FUNCTION pmt_term_dtls (p_date DATE)
      RETURN XMLTYPE;
       
   FUNCTION supplier_optns (p_date DATE)
      RETURN XMLTYPE;

  FUNCTION supplier_imm_pay_terms (p_date DATE)
      RETURN XMLTYPE;	  

END xx_sup_disc_info_pk;