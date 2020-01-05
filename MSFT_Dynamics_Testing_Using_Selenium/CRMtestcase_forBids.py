# -*- coding: utf-8 -*-
"""
Created on Wed May 16 12:49:07 2018

@author: pboya01
"""
import time
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys

wait10 = 10
waittime = 1

# create a new Firefox session
driver = webdriver.Chrome(r'C:\Downloads\chromedriver_win32\chromedriver.exe')
driver.implicitly_wait(waittime)
driver.maximize_window()

# Navigate to the application home page
driver.get("https://XXdev.crm.dynamics.com")

# get the search textbox
search_field = driver.find_element_by_id("i0116")
search_field.clear()

# enter search keyword and submit
search_field.send_keys("Self@pavanboyapati.com")
driver.implicitly_wait(waittime)
#search_field.submit()
time.sleep(3)
link = driver.find_element_by_id("idSIButton9")
link.click()


driver.implicitly_wait(waittime)
#time.sleep(5)
#search_field.submit()
#clicknext = driver.find_element_by_id("aadTile")  pavan102618
#clicknext.click()


driver.implicitly_wait(wait10)
time.sleep(3)
#search_field.submit()
clicknext1 = driver.find_element_by_id("idBtn_Back")
clicknext1.click()


driver.implicitly_wait(wait10)
time.sleep(3)
#search_field.submit()
driver.find_element_by_xpath("//*[@id='TabSFA']/a[1]/span[1]/span[1]").click()

time.sleep(3)
driver.implicitly_wait(wait10)
driver.find_element_by_xpath("//*[@id='Area_Operations']/span[1]/span[1]/img[1]").click()

#time.sleep(5)
#driver.implicitly_wait(5)
#driver.find_element_by_xpath("//*[@id='xx_commitment']/span[1]/span[1]/img[1]").click()
#
#

time.sleep(3)
driver.implicitly_wait(5)
driver.find_element_by_xpath("//span[@class='nav-rowLabel'][contains(text(),'Projects')]").click()



#for row in driver.find_elements_by_class_name("ms-crm-List-Data"):
#    for cell in row.find_elements_by_class_name("ms-crm-List-Row"):
#        cell.find_element_by_link_text('OH,&nbsp;COLUMBUS&nbsp;-&nbsp;4049&nbsp;E.&nbsp;LIVINGSTON&nbsp;AVE.&nbsp;(00003)').click()
#driver.find_element_by_id('gridBodyTable_primaryField_{663863D6-8A41-E811-811B-5065F38A9B71}_12').click()        


#link = driver.find_element_by_partial_link_text('4049 E. LIVINGSTON AVE. (00003)')
#link.click()

#for row in driver.find_elements_by_class_name("ms-crm-List-Data"):
 #   driver.find_element_by_xpath("//*[@id='gridBodyTable']/tbody/tr[13]/td[4]").click()
time.sleep(5)
driver.switch_to_frame("contentIFrame0")

window_before = driver.window_handles[0]
print ('window_before   - '+window_before)

time.sleep(3)
#driver.find_element_by_xpath("//a[@id='gridBodyTable_primaryField_{663863D6-8A41-E811-811B-5065F38A9B71}_12']").click()
#driver.find_element_by_xpath("//a[@id='gridBodyTable_primaryField_{663863D6-8A41-E811-811B-5065F38A9B71}_32']").click()  pavan102618
#driver.find_element_by_xpath("//a[@id='gridBodyTable_primaryField_{482AF9FB-92AB-E811-813A-C4346BDCC231}_11']").click()  pavan1220
#driver.find_element_by_xpath("//a[@id='gridBodyTable_primaryField_{7A81B32D-F8B1-E811-814A-5065F38A9B71}_2']").click()  pavan03202019
#driver.find_element_by_xpath("//a[@id='gridBodyTable_primaryField_{5501377F-ADE6-E811-8146-5065F38B51F1}_17']").click() pavan040119
driver.find_element_by_xpath("//a[@id='gridBodyTable_primaryField_{79D286BA-903B-E911-A84F-000D3A1F4157}_11']").click()
time.sleep(3)
#WebDriverWait(driver, 20).until(EC.number_of_windows_to_be(2))
#newWindow = [window for window in driver.window_handles if window != window_before][0]
#driver.switch_to.window(newWindow)
print ('after   - ')

#driver.switch_to_default_content

window_after = driver.window_handles[0]
#time.sleep(5)
driver.switch_to_window(window_after)
print ('window_after   - '+window_after)

time.sleep(3)
driver.implicitly_wait(10)
#driver.find_element_by_xpath("//span[@class='navTabButtonArrowRight']").click()
driver.find_element_by_xpath("//*[@id='TabNode_tab0Tab']/a[1]/span[1]/span[1]").click()


time.sleep(3)
driver.implicitly_wait(5)
driver.find_element_by_xpath("//*[@id='Node_nav_xx_projects_xx_bidpackage_projectid']/span[2]").click()


#//*[@id="TabNode_tab0Tab"]/a/span/span
#//span[@id='TabNode_tab0Tab']//a[@class='navTabButtonLink']//span[@class='navTabButtonImageContainer']//span[@class='navTabButtonArrowRight']

#contentIFrame1

#area_xx_projects_xx_bidpackage_projectidFrame


window_after1 = driver.window_handles[0]
#time.sleep(3)
driver.switch_to_window(window_after1)
print ('window_after1   - '+window_after1)

for handle in driver.window_handles:
    print('window_handles   - '+handle)


time.sleep(2)
driver.switch_to_frame('contentIFrame1')
time.sleep(2)
driver.switch_to_frame('area_xx_projects_xx_bidpackage_projectidFrame')
#print('after frame')
#driver.switch_to_default_content
#WebResource_externalprojectteam

time.sleep(2)
#driver.find_element_by_link_text("Alarm").click()
print('111')


#070418

#driver.find_element_by_xpath("//a[@id='gridBodyTable_primaryField_{E14FC4C2-0852-E811-811B-C4346BDCC231}_0']").click()
#driver.find_element_by_xpath("//*[@id='gridBodyTable_primaryField_{C567C7BF-8E4C-E811-8120-C4346BDCF2F1}_0']").click()
#driver.find_element_by_xpath("//*[@id='gridBodyTable_primaryField_{FE67C7BF-8E4C-E811-8120-C4346BDCF2F1}_3']").click()  --pavan 102618
#driver.find_element_by_xpath("//*[@id='gridBodyTable_primaryField_{5BED53B5-94AB-E811-813A-C4346BDCC231}_3']").click()   --pavan 122018
#driver.find_element_by_xpath("//*[@id='gridBodyTable_primaryField_{4875A748-92E3-E811-8146-5065F38B51F1}_0']").click()  --pavan 040119
driver.find_element_by_xpath("//*[@id='gridBodyTable_primaryField_{98F73D98-9954-E911-A849-000D3A1DD59B}_5']").click()
#time.sleep(10)
#driver.implicitly_wait(5)
#driver.find_element_by_xpath("//span[@class='nav-rowLabel'][contains(text(),'Budgets')]").click()
time.sleep(2)
driver.switch_to_frame('contentIFrame1')

time.sleep(3)
search_field = driver.find_element_by_id("xx_duedate_iDateInput")

#search_field.click()
hov = ActionChains(driver).move_to_element(search_field)

hov.click(search_field)
time.sleep(2)
hov.send_keys('07/05/2018')
hov.perform()


time.sleep(2)


search_field = driver.find_element_by_id("xx_bidinvitationsubject")

#search_field.click()
hov = ActionChains(driver).move_to_element(search_field)

hov.click(search_field)
hov.send_keys('Bid Invitation for Project  ')
hov.perform()

time.sleep(2)

#search_field = driver.find_element_by_id("xx_bidinvitationsubject_i")
search_field = driver.find_element_by_id("xx_bidinvitemessage")

#search_field.click()
hov = ActionChains(driver).move_to_element(search_field)


hov.click(search_field)
hov.send_keys('This invitation is for a new build -( Internal test ) ')
hov.perform()

#//*[@id="xx_duedate_iDateInput"]
# enter search keyword and submit

#search_field.send_keys("5/22/2018")

#
driver.switch_to_default_content()
time.sleep(3)
driver.find_element_by_xpath("//*[@id='xx_bidpackage|NoRelationship|Form|Mscrm.Form.xx_bidpackage.Save']/span/a/span").click()
time.sleep(3)
driver.find_element_by_xpath("//*[@id='xx_bidpackage|NoRelationship|Form|xx_bidpackage.invitation.Button']/span/a/span").click()
#//*[@id="xx_bidpackage|NoRelationship|Form|xx_bidpackage.invitation.Button"]/span/a/span

#time.sleep(5)
#driver.find_element_by_id("gridBodyTable_primaryField_{02F5CB5E-5342-E811-8115-5065F38B51F1}_3").click()
time.sleep(4)
driver.switch_to_frame('InlineDialog_Iframe')

time.sleep(3)
search_field = driver.find_element_by_id("crmGrid_findCriteria")
#search_field.send_keys('Pavan') --pavan04012019
search_field.send_keys('Adam')
time.sleep(3)
search_field.send_keys(u'\ue007')

#keys.ENTER, not as a string. 
time.sleep(3)
#search_field = driver.find_element_by_xpath("//*[@id='checkBox_{F0228476-D85A-E811-811C-5065F38B51F1}']") pavan04012019
search_field = driver.find_element_by_xpath("//*[@id='checkBox_{747869E4-1F99-E711-8129-E0071B6AA211}']")

hov = ActionChains(driver).move_to_element(search_field)
hov.click(search_field)
hov.perform()

print('999')
driver.find_element_by_xpath("//*[@id='btnAdd']").click()
time.sleep(3)
driver.find_element_by_xpath("//*[@id='butBegin']").click()
time.sleep(3)

driver.switch_to_default_content()
time.sleep(3)
driver.switch_to_frame('hisol-dialog-8_14_2-1')
time.sleep(3)
driver.switch_to_frame('aux-lookup-dialog-iframe')
print('3000')
#time.sleep(3)
try:
    driver.find_element_by_xpath("//*[@id='sendInv111']").click()
except:    
    print('Invitation sent')
time.sleep(5)
search_field.send_keys(u'\ue007')
time.sleep(5)
driver.close()
time.sleep(5)
#time.sleep(5)
#driver.implicitly_wait(5)
#driver.find_element_by_xpath("//li[@id='xx_commitment|NoRelationship|HomePageGrid|Mscrm.HomepageGrid.xx_commitment.NewRecord']//span[@tabindex='-1']//a[@tabindex='0']").click()
#//li[@id='xx_commitment|NoRelationship|HomePageGrid|Mscrm.HomepageGrid.xx_commitment.NewRecord']//span[@tabindex='-1']//a[@tabindex='0']


#search_field = driver.find_element_by_id("xx_name_i")
#search_field.clear()

# enter search keyword and submit
#search_field.send_keys("test_commitment")
# get the number of elements found
#print ("Found " + str(len(lists)) + " searches:")


# close the browser window
#driver.quit()
