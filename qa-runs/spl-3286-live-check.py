import os, json, gzip
from playwright.sync_api import sync_playwright

BASE='https://staging-umbraco.splatdev.tech'
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium-browser', args=['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'])
    page=browser.new_page()
    result={'url':BASE,'checks':[]}
    def check(name, ok, detail): result['checks'].append({'name':name,'pass':ok,'detail':detail})
    for path in ['/umbraco/pdfcurator/api/v1/member/books','/umbraco/pdfcurator/api/v1/member/favorites']:
        r=page.request.get(BASE+path)
        ct=r.headers.get('content-type',''); body=r.text()
        check('anonymous '+path, r.status==401 and 'application/json' in ct and 'Authentication required' in body, {'status':r.status,'contentType':ct,'body':body[:200]})
    r=page.request.get(BASE+'/App_Plugins/PdfCurator/umbraco-package.json')
    check('package asset registered',r.status==200 and 'PdfCurator.Section' in r.text(),{'status':r.status,'bytes':len(r.body())})
    page.goto(BASE+'/umbraco',wait_until='domcontentloaded',timeout=60000)
    page.wait_for_timeout(3000)
    page.screenshot(path='qa-runs/spl-3286-backoffice-login.png',full_page=True)
    check('backoffice reachable', 'login' in page.url.lower() or 'umbraco' in page.url.lower(), {'finalUrl':page.url,'title':page.title()})
    user=os.getenv('Umbraco_default_username'); pw=os.getenv('Umbraco_default_password')
    if user and pw and page.locator('input').count():
        inputs=page.locator('input')
        for i in range(inputs.count()):
            typ=inputs.nth(i).get_attribute('type') or ''
            if typ=='email' or 'user' in (inputs.nth(i).get_attribute('name') or '').lower(): inputs.nth(i).fill(user); break
        for i in range(inputs.count()):
            typ=inputs.nth(i).get_attribute('type') or ''
            if typ=='password': inputs.nth(i).fill(pw); break
        btn=page.get_by_role('button').first
        if btn.count(): btn.click(); page.wait_for_timeout(5000)
        check('backoffice admin login', 'login' not in page.url.lower(), {'finalUrl':page.url,'title':page.title()})
        page.screenshot(path='qa-runs/spl-3286-backoffice-authenticated.png',full_page=True)
    browser.close()
with open('qa-runs/spl-3286-live-check.json','w') as f: json.dump(result,f,indent=2)
print(json.dumps(result,indent=2))
