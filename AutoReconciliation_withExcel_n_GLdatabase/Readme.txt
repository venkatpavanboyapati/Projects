-----

This program is used as a quick interface to fetch last volume of consolidated GL data from database. 
This helps business users for periodend and yearend reconciliations that interfaces with other excel spreadsheets using Vlookups.

Program uses XLwings to interface with Excel to read all inputs and posts output into separate tabs.
Program also contains custom UDF functions to fetch specific values. Please open excel in Developer mode to know more about it.
    WenGetDesc
    WenGetActiveInfo
    WenGetBalance
    WenGetInvoiceInfo

--
Downloaded xlwings and Added it in Excel addins (Developer -> ExcelAddin -> Browse -> Select xlwings)

Make sure references is slected in Visual Basic

follow link
https://docs.xlwings.org/en/stable/addin.html

Install cx_Oracle to run oracle Queries.
