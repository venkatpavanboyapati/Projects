
# -*- coding: utf-8 -*-
"""
Created on Mon May 20 13:46:11 2019

@author: PBOYA01
"""



import cx_Oracle
import os

import io
import sys
import difflib

from filecmp import dircmp

dsn_tns = cx_Oracle.makedsn('XXInstance', 'XXport', service_name='XXDEV') #if needed, place an 'r' before any parameter in order to address any special character such as '\'.
conn_inst1 = cx_Oracle.connect(user=r'apps', password='xxxxxxdblu3', dsn=dsn_tns) #if needed, place an 'r' before any parameter in order to address any special character such as '\'. For example, if your user name contains '\', you'll need to place 'r' before the user name: user=r'User Name'
dsn_tns = cx_Oracle.makedsn('XXInstance', 'XXport', service_name='XXPROD') #if needed, place an 'r' before any parameter in order to address any special character such as ''.
conn_inst2 = cx_Oracle.connect(user=r'apps', password='xxxxx4ck3ts', dsn=dsn_tns) #if needed, place an 'r' before any parameter in order to address any special character such as ''. For example, if your user name contains '', you'll need to place 'r' before the user name: user=r'User Name'

c_main = conn_inst1.cursor()

query = """select distinct name  from all_source where ( upper(name) like '%XXSCHEMA%' or upper(name) like '%XX%') and type in ( 'PROCEDURE', 'PACKAGE BODY') 
           """
c_main.execute(query) # use triple quotes if you want to spread your query across multiple lines
for row in c_main:
    
    detquery = """select trim(text) from all_source where upper(name) = '"""+ ''.join(row) +"""' and type in ( 'PROCEDURE', 'PACKAGE BODY')  order by Line  
                   """
    c_det = conn_inst1.cursor()        
    c_det.execute(detquery)  
    lst = c_det.fetchall()    

    filenm1 =  'C:\Fetch_n_Compare\dev\\' + ''.join(row) + '.sql'
    tfile = open(filenm1, 'w')
    for value in lst:
        tfile.write("%s" % ", ".join(value))

    tfile.close()
conn_inst1.close()


c_main = conn_inst2.cursor()

query = """select distinct name  from all_source where upper(name) like '%XXSCHEMA%' or upper(name) like '%XX%' and type in ( 'PROCEDURE', 'PACKAGE BODY') 
           """
c_main.execute(query) # use triple quotes if you want to spread your query across multiple lines
for row in c_main:
    
    detquery = """select trim(text) from all_source where upper(name) = '"""+ ''.join(row) +"""' and type in ( 'PROCEDURE', 'PACKAGE BODY')  order by Line  
                   """
    c_det = conn_inst2.cursor()        
    c_det.execute(detquery)  
    lst = c_det.fetchall()    

    filenm2 =  'C:\Fetch_n_Compare\prod\\' + ''.join(row) + '.sql'
    tfile = open(filenm2, 'w')
    for value in lst:
        tfile.write("%s" % ", ".join(value))

    tfile.close()
conn_inst2.close()


def print_diff_files(dcmp):
    finalresfname =  'C:\Fetch_n_Compare\diffresult\HighLevelReport.txt'
    finalresfile = open(finalresfname, 'w')
    for name in dcmp.diff_files:
        print("File Difference Noticed in %s found in %s and %s"% (name, dcmp.left,dcmp.right))
        finalresfile.write("File Difference Noticed in %s found in %s and %s"% (name, dcmp.left,dcmp.right)+"\n")
        text1 = open(dcmp.left+name).readlines()
        text2 = open(dcmp.right+name).readlines()
        #resfilename =  'C:\Wendys\Mywork\OracleEBS\Sabrix\Sabrix Upgrade Project\Fetch_n_Compare\diffresult\\' + ''.join(name).replace('.sql',"") + '.txt'
        resfilenamehtml =  'C:\Fetch_n_Compare\diffresult\\' + ''.join(name).replace('.sql',"") + '.html'
        #resfile = open(resfilename, 'w')
        #for line in difflib.unified_diff(text1, text2):
        #    resfile.write(line)     
        #resfile.close()
        differ = difflib.HtmlDiff( tabsize=8, wrapcolumn=90 ) #90 #65
        html = differ.make_file( text1, text2, context=False )
        outfile = open( resfilenamehtml, 'w' )
        outfile.write(html)
        outfile.close()
    for name in dcmp.left_only:
        print("File %s is only found in %s" % (name, dcmp.left))
        finalresfile.write("File %s is only found in %s" % (name, dcmp.left)+"\n")
    for name in dcmp.right_only:
        print("File %s is only found in %s" % (name, dcmp.right))
        finalresfile.write("File %s is only found in %s" % (name, dcmp.right)+"\n")
    for sub_dcmp in dcmp.subdirs.values():
        print_diff_files(sub_dcmp)
    finalresfile.close()
        
dcmp = dircmp('C:\Fetch_n_Compare\dev\\','C:\Fetch_n_Compare\pay\\') 

print_diff_files(dcmp)



