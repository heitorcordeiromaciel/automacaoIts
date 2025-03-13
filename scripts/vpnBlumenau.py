#!/usr/bin/env python
# coding: utf-8

# In[9]:


from selenium import webdriver
from webdriver_manager.microsoft import EdgeChromiumDriverManager
from selenium.webdriver.edge.service import Service
from selenium.webdriver.common.by import By
import time

servico = Service(EdgeChromiumDriverManager().install())

driver = webdriver.Edge(service=servico)
driver.get("https://192.168.1.1/")
driver.find_element(By.XPATH, '//*[@id="details-button"]').click()
driver.find_element(By.XPATH, '//*[@id="proceed-link"]').click()
driver.find_element(By.ID, 'usernamefld').send_keys("julio")
driver.find_element(By.ID, 'passwordfld').send_keys("imperatriz@135")
driver.find_element(By.XPATH, '//*[@id="total"]/div/div[2]/div/form/input[4]').click()
driver.find_element(By.XPATH, '//*[@id="topmenu"]/div/div[1]/button/span[3]').click()
driver.find_element(By.XPATH, '//*[@id="pf-navbar"]/ul[1]/li[6]/a').click()
driver.find_element(By.XPATH, '//*[@id="pf-navbar"]/ul[1]/li[6]/ul/li[11]/a').click()
driver.find_element(By.ID, 'ipsecstatus-disconnect-ike-con5-570').click()

# In[ ]:




