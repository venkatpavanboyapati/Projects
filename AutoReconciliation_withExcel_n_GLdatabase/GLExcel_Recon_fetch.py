import xlwings as xw
from datetime import datetime
import pandas as pd

import cx_Oracle


#def convertval(x):
#    if x.isdigit():
#        res=int(x)
#    else:
#        res=str(x)
#    return res

def FetchSheetValues(x):
    sht = xw.Book.caller().sheets[0]
    Data=sht.range(x).value
    Data=pd.Series(Data)
    Data=Data.dropna()
    result = ",".join(["'"+str(i).split('.')[0]+"'" for i in Data])
    return result


def hello_xlwings():
    current_time = datetime.now()
    wb = xw.Book.caller()
    wb.sheets[0].range('O3').expand().clear_contents()
    wb.sheets[0].range('O10').expand().clear_contents()
    wb.sheets[0].range("O3").value = "Oracle Fetch program started  " + current_time.strftime('%m/%d %I:%M%p')    
    #print("Hello xlwings!")   
    
    dsn_tns = cx_Oracle.makedsn('XXscan', '1521', service_name='XXdev') #if needed, place an 'r' before any parameter in order to address any special character such as '\'.
    conn = cx_Oracle.connect(user=r'apps', password='XXXXndblu3', dsn=dsn_tns) #if needed, place an 'r' before any parameter in order to address any special character such as '\'. For example, if your user name contains '\', you'll need to place 'r' before the user name: user=r'User Name'
    wb.sheets[0].range("O4").value = "Connected to Oracle DB " 
    cursor = conn.cursor()
    
    #period = "'"+wb.sheets[0].range("B6").value+"'"
    
    period = FetchSheetValues('A07:A13')
    
    GetccValues = FetchSheetValues('A23:A90')
    
    Getadvrt  = FetchSheetValues('C23:C29')
    Getfoodcst = FetchSheetValues('D23:D60')
    Getkidmls = FetchSheetValues('E23:E25')
    Getnetsales = FetchSheetValues('F23:F128')
    GetLabor = FetchSheetValues('G23:G28')
    Getotheracts = FetchSheetValues('H23:H38')
    
    Gettotlabor = FetchSheetValues('J23:J38')
    #Gettotsales = FetchSheetValues('K23:K128')
    Gettotsales = Getnetsales
    #Gettotfoodcst = FetchSheetValues('L23:L60')
    Gettotfoodcst = Getfoodcst
    Gettotpapercst = FetchSheetValues('M23:M28')
    
    wb.sheets[0].range("O5").value = "Fetched all Parameter values from SpreadSheet  " 
    # detquery
    wb.sheets[0].range("O6").value = "Start of Execution for DETAIL Query  " + current_time.strftime('%m/%d %I:%M%p') 
    detquery = """SELECT case 
                     when GCC.SEGMENT3 in ("""+ Getadvrt +""") then 'Advertising' 
                     when GCC.SEGMENT3 in ("""+ Getfoodcst +""") then 'Food_Cost' 
                     when GCC.SEGMENT3 in ("""+ Getkidmls +""") then 'Kid_Meals' 
                     when GCC.SEGMENT3 in ("""+ Getnetsales +""") then 'Net Sales' 
                     when GCC.SEGMENT3 in ("""+ GetLabor +""") then '50170X Labor' 
                     when GCC.SEGMENT3 in ("""+ Getotheracts +""") then 'Other Accounts' 
                     else 'Other' end AS "Type_of_Account",
       cfvl.PARENT_FLEX_VALUE AS "Area",
       GCC.SEGMENT2 AS "Cost_Center",
       GCC.SEGMENT3 AS "Account",
       gjl.Period_Name "Period_Name",
       NVL (gjl.accounted_dr, 0) AS "Dr",
       NVL (gjl.accounted_cr, 0) AS "Cr",
       (NVL (gjl.accounted_dr, 0) - NVL (gjl.accounted_cr, 0)) AS "Amount",
       gjl.description AS "JE_Line_Description",
       invdet.batch_name "Batch_Name",
       NULL AS "Refresh"
  FROM gl.gl_je_lines gjl
       LEFT OUTER JOIN
       (SELECT GJL2.je_line_num, gjl2.je_header_id, apba2.batch_name
          FROM ap.ap_batches_all apba2,
               ap.ap_invoices_all aia2,
               xla.xla_transaction_entities xte2,
               xla.xla_ae_headers xah2,
               xla.xla_ae_lines xal2,
               gl.gl_import_references gir2,
               gl.gl_je_lines gjl2,
               gl.gl_je_headers gjh2
         WHERE     1 = 1
               AND apba2.batch_id = aia2.batch_id
               AND aia2.invoice_id = NVL ("SOURCE_ID_INT_1", (-99))
               AND xte2.entity_code = 'AP_INVOICES'
               AND xte2.application_id = 200
               AND xte2.entity_id = xah2.entity_id
               AND xah2.ae_header_id = xal2.ae_header_id
               AND xal2.gl_sl_link_id = gir2.gl_sl_link_id
               AND xal2.gl_sl_link_table = gir2.gl_sl_link_table
               AND gir2.je_header_id = gjl2.je_header_id
               AND gir2.je_line_num = gjl2.je_line_num
               AND gjl2.je_header_id = gjh2.je_header_id
               AND gjl2.period_name IN ("""+ period +""")) INVDET
          ON     gjl.je_header_id = invdet.je_header_id
             AND GJL.je_line_num = INVDET.je_line_num,
       GL.GL_CODE_COMBINATIONS GCC,
       applsys.FND_FLEX_VALUE_HIERARCHIES cfvl
 WHERE     gjl.PERIOD_NAME IN ("""+ period +""") 
       AND GCC.CODE_COMBINATION_ID = gjl.CODE_COMBINATION_ID
       AND gcc.segment2 = cfvl.CHILD_FLEX_VALUE_LOW
       AND cfvl.PARENT_FLEX_VALUE IN ( """+ GetccValues +""" )
       AND GCC.SEGMENT3 IN ( """+ Getadvrt+Getfoodcst+Getkidmls+Getnetsales+GetLabor+Getotheracts +""" )
      and rownum < 2000
           """
           
    wb.sheets[0].range("O7").value = "Executing Query ...."
   # param = (period)
    cursor.execute(detquery)
   # named_params = {'Period': ('07-18','08-18')}
   # cursor.execute(detquery,named_params)

    # Get the result and column names
    col_names = [col[0] for col in cursor.description]
    rows = cursor.fetchall()

    # Clear the sheet and write the column names and result to Excel
    #sht = wb.sheets.active
    sht = wb.sheets("Detail")
    sht.range('A1').expand().clear_contents()
    sht.range('A1').value = col_names
    if len(rows):
        sht.range('A2').value = rows
    else:
        sht.range('A2').value = 'Empty Info!'

    cursor.close()
    # detquery
    wb.sheets[0].range("O8").value = "Completed - GL Details Records   " + current_time.strftime('%m/%d %I:%M%p') 
    wb.sheets[0].range("O10").value = "Start of Execution for SUMMARY Query  " + current_time.strftime('%m/%d %I:%M%p') 
    detsummquery = """SELECT DISTINCT (GCC.SEGMENT2),
                GCC.SEGMENT3,
                GLB.PERIOD_NAME,
                GLB.ACTUAL_FLAG,
                GLB.PERIOD_NET_DR,
                GLB.PERIOD_NET_CR,
                --(GLB.PERIOD_NET_DR - GLB.PERIOD_NET_CR),
                case 
                     when GCC.SEGMENT3 in ("""+ Gettotlabor +""") then 'Advertising' 
                     when GCC.SEGMENT3 in ("""+ Gettotsales +""") then 'Food_Cost' 
                     when GCC.SEGMENT3 in ("""+ Gettotfoodcst +""") then 'Kid_Meals' 
                     when GCC.SEGMENT3 in ("""+ Gettotpapercst +""") then 'Net Sales'   else 'Other' end   AS "Type_of_Account"
  FROM GL.GL_BALANCES GLB,
       GL.GL_CODE_COMBINATIONS GCC,
       APPLSYS.FND_FLEX_VALUE_HIERARCHIES FVH
 WHERE   GLB.PERIOD_NAME IN ("""+ period +""") 
       AND GCC.CODE_COMBINATION_ID = GLB.CODE_COMBINATION_ID
       AND GCC.SEGMENT2 = FVH.CHILD_FLEX_VALUE_LOW
       AND FVH.PARENT_FLEX_VALUE IN ( """+ GetccValues +""" )
       AND GCC.SEGMENT3 IN ( """+ Gettotlabor+Gettotsales+Gettotfoodcst+Gettotpapercst+""" )
       AND GLB.ACTUAL_FLAG = 'A'
       AND (GLB.PERIOD_NET_DR - GLB.PERIOD_NET_CR) <> 0
      and rownum < 2000
           """
    summcursor = conn.cursor()       
    summcursor.execute(detsummquery)
    # Get the result and column names
    summcol_names = [summcol[0] for summcol in summcursor.description]
    summrows = summcursor.fetchall()
    
    summsht = wb.sheets("Summary")
    summsht.range('A1').expand().clear_contents()
    summsht.range('A1').value = summcol_names
    if len(summrows):
        summsht.range('A2').value = summrows
    else:
        summsht.range('A2').value = 'Empty Info!'
        
    wb.sheets[0].range("O11").value = "Completed - GL Summary Records   " + current_time.strftime('%m/%d %I:%M%p') 
    # Close cursor and connection
    wb.sheets[0].range("H9").value = "Last Refreshed On : " + current_time.strftime('%m/%d/%Y  %I:%M %p')
    summcursor.close()
    conn.close()
    wb.sheets[0].range("O12").value = "DB connection closed .. !!"
    #shtsumm = wb.sheets("Summary")
    #shtsumm.range('C4').expand().clear_contents()
    #shtsumm.range('C4').value = period+"   ------  "+Getfoodcst+" ------  "+ Getkidmls +" ------  "+Gettotpapercst
    #FetchSheetValues('A23:A90')
    
    logsht = wb.sheets("Detailedlog")
    logsht.range('C4').expand().clear_contents()
    logsht.range('C4').value = period+"   ------  "+Getfoodcst+" ------  "+ Getkidmls +" ------  "+Gettotpapercst
    
    logsht.range('C10').expand().clear_contents()
    logsht.range('C10').value = " DetailQuery   ------  "+detquery
    
    logsht.range('C15').expand().clear_contents()
    logsht.range('C15').value =" SummaryQuery   ------  "+detsummquery


@xw.func
def hello(name):
    return "hello {0}".format(name)


@xw.func
def WenGetDesc(x):
    """Returns Gl object description"""
    dsn_tns = cx_Oracle.makedsn('exa2-scan', '1521', service_name='ebsdev') #if needed, place an 'r' before any parameter in order to address any special character such as '\'.
    conn = cx_Oracle.connect(user=r'apps', password='or4ng34ndblu3', dsn=dsn_tns) #if needed, place an 'r' before any parameter in order to address any special character such as '\'. For example, if your user name contains '\', you'll need to place 'r' before the user name: user=r'User Name'
    cursor = conn.cursor()
    detquery = """ SELECT    V.Description 
FROM   APPLSYS.FND_FLEX_VALUE_SETS S
       INNER JOIN APPS.FND_FLEX_VALUES_VL V
         ON V.FLEX_VALUE_SET_ID = S.FLEX_VALUE_SET_ID
WHERE  S.FLEX_VALUE_SET_NAME IN ('WEN_COST_CENTER', 'ARG_COST_CENTER','WEN_ACCOUNTS', 'ARG_ACCOUNTS','WEN_COMPANIES', 'ARG_COMPANIES')
       AND V.ENABLED_FLAG = 'Y'
      and flex_value = '"""+str(x).split('.')[0]+"""'"""
    cursor.execute(detquery)
    res = cursor.fetchall()
    cursor.close()
    conn.close()
    return res


@xw.func
def WenGetActiveInfo(x):
    """Returns Active Info"""
    dsn_tns = cx_Oracle.makedsn('exa2-scan', '1521', service_name='ebsdev') #if needed, place an 'r' before any parameter in order to address any special character such as '\'.
    conn = cx_Oracle.connect(user=r'apps', password='or4ng34ndblu3', dsn=dsn_tns) #if needed, place an 'r' before any parameter in order to address any special character such as '\'. For example, if your user name contains '\', you'll need to place 'r' before the user name: user=r'User Name'
    cursor = conn.cursor()
    detquery = """ SELECT   'START_DATE_ACTIVE   '||START_DATE_ACTIVE ||' //  END_DATE_ACTIVE  '||V.END_DATE_ACTIVE||' //  ENABLED_FLAG - '||V.ENABLED_FLAG
FROM   APPLSYS.FND_FLEX_VALUE_SETS S
       INNER JOIN APPS.FND_FLEX_VALUES_VL V
         ON V.FLEX_VALUE_SET_ID = S.FLEX_VALUE_SET_ID
WHERE  S.FLEX_VALUE_SET_NAME IN ('WEN_COST_CENTER', 'ARG_COST_CENTER','WEN_ACCOUNTS', 'ARG_ACCOUNTS','WEN_COMPANIES', 'ARG_COMPANIES')
       AND V.ENABLED_FLAG = 'Y'
      and flex_value = '"""+str(x).split('.')[0]+"""'"""
    cursor.execute(detquery)
    res = cursor.fetchall()
    cursor.close()
    conn.close()
    return res

@xw.func(async_mode='threading')
#@xw.func
def WenGetBalance(x1,x2,x3,x4):
    """Returns Costcenter Info"""
    dsn_tns = cx_Oracle.makedsn('exa2-scan', '1521', service_name='ebsdev') #if needed, place an 'r' before any parameter in order to address any special character such as '\'.
    conn = cx_Oracle.connect(user=r'apps', password='or4ng34ndblu3', dsn=dsn_tns) #if needed, place an 'r' before any parameter in order to address any special character such as '\'. For example, if your user name contains '\', you'll need to place 'r' before the user name: user=r'User Name'
    cursor = conn.cursor()
    detquery = """ SELECT Sum(GLB.PERIOD_NET_DR - GLB.PERIOD_NET_CR)
  FROM GL.GL_BALANCES GLB,
       GL.GL_CODE_COMBINATIONS GCC
 WHERE  1=1
       AND GCC.CODE_COMBINATION_ID = GLB.CODE_COMBINATION_ID     
       AND GCC.SEGMENT1 = NVL( '"""+str(x1).split('.')[0]+"""',GCC.SEGMENT1)
       AND GCC.SEGMENT2 = NVL('"""+str(x2).split('.')[0]+"""',GCC.SEGMENT2)
       AND GCC.SEGMENT3 = NVL('"""+str(x3).split('.')[0]+"""',GCC.SEGMENT3)
       AND GCC.SEGMENT4 = '000'
       AND GLB.ACTUAL_FLAG = 'A'
       AND (GLB.PERIOD_NET_DR - GLB.PERIOD_NET_CR) <> 0
       """
    cursor.execute(detquery)
    res = cursor.fetchall()
    cursor.close()
    conn.close()
    return res


@xw.func
def WenGetInvoiceInfo(x):
    """Returns Invoice Info"""
    dsn_tns = cx_Oracle.makedsn('exa2-scan', '1521', service_name='ebsdev') #if needed, place an 'r' before any parameter in order to address any special character such as '\'.
    conn = cx_Oracle.connect(user=r'apps', password='or4ng34ndblu3', dsn=dsn_tns) #if needed, place an 'r' before any parameter in order to address any special character such as '\'. For example, if your user name contains '\', you'll need to place 'r' before the user name: user=r'User Name'
    cursor = conn.cursor()
    detquery = """  Select 'Source - '||source ||' //  Invoice_Date  '||V.Invoice_date||' //  Invoice_Amount - '||V.Invoice_Amount ||' //  Paid - '||nvl2(amount_paid,'No','Yes') ||' //  '||V.description
 from ap_invoices_all V
 where invoice_num = '"""+str(x).split('.')[0]+"""'"""
    cursor.execute(detquery)
    res = cursor.fetchall()
    cursor.close()
    conn.close()
    return res
