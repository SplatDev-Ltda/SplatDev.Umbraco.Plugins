import { chromium } from 'playwright';
const base='https://staging-umbraco.splatdev.tech';
const browser=await chromium.launch({headless:true, executablePath:'/usr/bin/chromium-browser', args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
const page=await browser.newPage(); const out=[];
const check=(name, pass, detail)=>out.push({name,pass,detail});
for (const path of ['/umbraco/pdfcurator/api/v1/member/books','/umbraco/pdfcurator/api/v1/member/favorites']) { const r=await page.request.get(base+path); const body=await r.text(); check('anonymous '+path,r.status()===401 && (r.headers()['content-type']||'').includes('application/json') && body.includes('Authentication required'),{status:r.status(),body}); }
await page.goto(base+'/umbraco', {waitUntil:'domcontentloaded',timeout:60000}); await page.waitForTimeout(3000); await page.screenshot({path:'qa-runs/spl-3286-backoffice-login.png',fullPage:true}); check('backoffice reachable',page.url().includes('umbraco'),{url:page.url(),title:await page.title()});
const user=process.env.Umbraco_default_username, pw=process.env.Umbraco_default_password;
if(user && pw && await page.locator('input').count()){ for(const x of await page.locator('input').all()){const t=await x.getAttribute('type'), n=(await x.getAttribute('name'))||''; if(t==='email'||n.toLowerCase().includes('user')){await x.fill(user);break;}} for(const x of await page.locator('input').all()){if(await x.getAttribute('type')==='password'){await x.fill(pw);break;}} await page.getByRole('button').first().click(); await page.waitForTimeout(5000); check('backoffice admin login',!page.url().toLowerCase().includes('login'),{url:page.url(),title:await page.title()}); await page.screenshot({path:'qa-runs/spl-3286-backoffice-authenticated.png',fullPage:true}); }
console.log(JSON.stringify({checks:out},null,2)); await browser.close();
