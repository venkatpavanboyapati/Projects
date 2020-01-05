# -*- coding: utf-8 -*-
"""
Created on Tue May 14 15:59:34 2019

@author: PBOYA01
"""


import time
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.chrome.options import Options


import pywinauto
import sys
import time
import pyautogui as pg

from pywinauto.application import Application

from pywinauto import keyboard 


wait10 = 10
waittime = 1

#chrome_options = Options()
#chrome_options.add_extension(r'C:\Users\PBOYA01\Downloads\chromeextn\hehijbfgiekmjfkfjpbkbammjbdenadd')


cap = DesiredCapabilities.INTERNETEXPLORER.copy()
cap['INTRODUCE_FLAKINESS_BY_IGNORING_SECURITY_DOMAINS'] = True
cap['acceptSslCerts'] = True
#driver = webdriver.Ie(capabilities=cap, executable_path=r'C:\Utility\BrowserDrivers\IEDriverServer.exe')
#driver.get('https://google.com')


#driver = webdriver.Chrome(chrome_options=chrome_options, executable_path=r'C:\Users\PBOYA01\Downloads\chromedriver_win32\chromedriver.exe')
#driver.implicitly_wait(waittime)
#driver.maximize_window()
driver = webdriver.Ie(capabilities=cap, executable_path=r'C:\Users\XXPBOYA01\Downloads\IEDriverServer_Win32_2.41.0\IEDriverServer.exe')
driver.get("https://XX09.XXernal:4446/OA_HTML/AppsLogin")
time.sleep(3)
# get the search textbox
search_field = driver.find_element_by_id("unamebean")
search_field.clear()

# enter search keyword and submit
search_field.send_keys("pboya01")
#driver.implicitly_wait(waittime)
time.sleep(3)
search_field = driver.find_element_by_id("pwdbean")
search_field.clear()
search_field.send_keys("XXcome5")
driver.implicitly_wait(waittime)
print('after pwd')
time.sleep(2)
print('beforesubmit')
link = driver.find_element_by_id("SubmitButton")
#link = driver.find_element_by_xpath("//*[@id='SubmitButton']")
#time.sleep(4)
print('aftersumit')
#link.click()
link.send_keys(u'\ue007')
print('aftersubmit click')
time.sleep(3)
link = driver.find_element_by_partial_link_text('XXSystem Administrator')
#link.click()
link.send_keys(u'\ue007')
time.sleep(1)
link = driver.find_element_by_partial_link_text('Requests')
time.sleep(1)
#link.click()
link.send_keys(u'\ue007')
time.sleep(10)


#time.sleep(12)
#Whandles = driver.getWindowHandles()
#print(Whandles)
#window_before = driver.window_handles[0]
#window_after = driver.window_handles[1]
#driver.switch_to_window(window_after)

handles = driver.window_handles;
size = len(handles);

for x in range(size):
	driver.switch_to.window(handles[x]);
	print (driver.title);
    
    
    
theHandle = pywinauto.findwindows.find_window(title_re ='XXOracle Applications - EBSDEV E-Business Suite - Refresh from EBSPRD as of 11/06/2018')
app = pywinauto.application.Application()
ac = app.connect(handle = theHandle)      
print(ac)
window = app.window_(handle = theHandle)
window.set_focus()
window.maximize()
time.sleep(10)
#keyboard.type_Keys("F4")

pg.hotkey('F4')
time.sleep(2)
pg.hotkey('alt', 'f')
time.sleep(2)
pg.hotkey('w')
time.sleep(2)
pg.typewrite('wen ap m', interval=0.25)
time.sleep(2)
pg.press('enter')
time.sleep(1)
pg.press('enter')
pg.press('enter')

time.sleep(2)
pg.press(['tab', 'tab', 'tab', 'tab', 'tab'])
time.sleep(2)
pg.typewrite('XX1055800381b', interval=0.1)
time.sleep(1)
pg.press('tab')
time.sleep(1)
pg.press('enter')
