"""Exercise the installed Firefox, using isolated browser/server profiles."""
import os, pathlib, tempfile, subprocess, time, json, urllib.request
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.common.by import By

root=pathlib.Path(__file__).resolve().parent.parent
out=pathlib.Path(tempfile.mkdtemp(prefix='cow-firefox-'))
origin='http://127.0.0.1:8194'
server=subprocess.Popen(['C:/Program Files/nodejs/node.exe','server.js'],cwd=root,env={**os.environ,'PORT':'8194','DATA_DIR':str(out/'data'),'TEACHER_PIN':'654321','SESSION_SECRET':'firefox-test'},stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
driver=None
try:
 for _ in range(100):
  try:
   urllib.request.urlopen(origin+'/api/health');break
  except Exception:time.sleep(.1)
 options=webdriver.FirefoxOptions();options.binary_location='C:/Program Files (x86)/Mozilla Firefox/firefox.exe';options.add_argument('-headless')
 driver=webdriver.Firefox(options=options);driver.set_window_size(1920,1080);driver.set_script_timeout(30)
 driver.get(origin)
 status=driver.execute_async_script("const done=arguments[0];fetch('/api/auth/teacher',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pin:'654321'})}).then(r=>done(r.status))");assert status==200,status
 driver.refresh();wait=WebDriverWait(driver,30)
 wait.until(lambda d:d.execute_script("return document.querySelector('.companion-picker select')?.disabled===false"))
 wait.until(lambda d:d.find_elements(By.CSS_SELECTOR,'.header-account-summary'))
 driver.find_element(By.CSS_SELECTOR,'.header-account-summary').click();driver.find_element(By.CSS_SELECTOR,'.header-account-menu [data-companion-open]').click()
 Select(driver.find_element(By.ID,'pet-select')).select_by_value('highland')
 wait.until(lambda d:d.execute_script("return document.querySelector('.highland-companion')?.dataset.ready==='true'"))
 driver.find_element(By.CSS_SELECTOR,'[data-subtab=accessories]').click()
 driver.find_element(By.CSS_SELECTOR,'[data-choice-key=headwear][data-choice=wreath]').click()
 driver.find_element(By.CSS_SELECTOR,'[data-choice-key=neckwear][data-choice=scarf]').click()
 time.sleep(.3)
 assert driver.execute_script("return document.querySelector('.highland-companion').dataset.accessoryRenderer")=='canvas'
 # Check pixels, not just transform attributes: rendered accessories must exist
 # and keep changing during a breathing cycle in the real Firefox engine.
 result=driver.execute_async_script("""const done=arguments[0],c=document.querySelector('[data-highland-accessory-surface]'),ctx=c.getContext('2d');let last,changes=0,nonempty=0,n=0;function sample(){const a=ctx.getImageData(0,0,c.width,c.height).data;let diff=0,alpha=0;for(let i=3;i<a.length;i+=4){alpha+=a[i];if(last)diff+=Math.abs(a[i]-last[i])+Math.abs(a[i-1]-last[i-1])}if(alpha>1000)nonempty++;if(diff>100)changes++;last=a;if(++n<90)requestAnimationFrame(sample);else done({nonempty,changes,width:c.width})}requestAnimationFrame(sample)""")
 assert result['nonempty']==90,result
 assert result['changes']>75,result
 driver.find_element(By.CSS_SELECTOR,'.highland-companion').screenshot(str(out/'studio-cow.png'))
 driver.find_element(By.ID,'dance').click()
 assert driver.execute_script("return document.querySelector('.highland-companion').dataset.headwear")=='headphones'
 assert driver.execute_script("return getComputedStyle(document.querySelector('[data-ha=headphones]')).visibility")=='visible'
 driver.find_element(By.ID,'dance').click()
 assert driver.execute_script("return document.querySelector('.highland-companion').dataset.headwear")=='wreath'
 driver.find_element(By.CSS_SELECTOR,'[data-tab=settings]').click()
 driver.find_element(By.CSS_SELECTOR,'[data-toggle=motion]').click();time.sleep(.2)
 frozen=driver.execute_script("return document.querySelector('[data-highland-accessory-surface]').toDataURL()")
 time.sleep(.2)
 assert frozen==driver.execute_script("return document.querySelector('[data-highland-accessory-surface]').toDataURL()")
 driver.find_element(By.CSS_SELECTOR,'[data-toggle=motion]').click()
 driver.find_element(By.CSS_SELECTOR,'.studio-close').click();time.sleep(.2)
 driver.find_element(By.CSS_SELECTOR,'.highland-companion').screenshot(str(out/'floating-cow.png'))
 for size in ['small','medium','large','extra-large']:
  driver.execute_script("document.querySelector('.highland-companion').dataset.size=arguments[0]",size);time.sleep(.15)
  assert driver.execute_script("const c=document.querySelector('[data-highland-accessory-surface]');return c.getContext('2d').getImageData(0,0,c.width,c.height).data.some((v,i)=>i%4===3&&v>0)")
  driver.find_element(By.CSS_SELECTOR,'.highland-companion').screenshot(str(out/('size-'+size+'.png')))
 print('PASS Firefox',driver.capabilities['browserVersion'],result,'screenshots:',out,flush=True)
finally:
 if driver:driver.quit()
 server.terminate();server.wait(timeout=10)
