import { chromium } from 'playwright';
const base='https://staging-umbraco.splatdev.tech';
const browser=await chromium.launch({headless:true, executablePath:'/usr/bin/chromium-browser', args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
const page=await browser.newPage();
await page.goto(base+'/umbraco', {waitUntil:'domcontentloaded',timeout:60000}); await page.waitForTimeout(3000);
console.log('url',page.url()); console.log('inputs',await page.locator('input').evaluateAll(xs=>xs.map(x=>({id:x.id,name:x.name,type:x.type,placeholder:x.placeholder}))));
console.log('buttons',await page.locator('button').evaluateAll(xs=>xs.map(x=>({text:x.innerText,type:x.type,id:x.id}))))
const email=process.env.U17_STAGING_ADMIN_EMAIL, pw=process.env.U17_STAGING_ADMIN_PASSWORD;
await page.locator('input[type=email], input[name*=email i], input[id*=username i]').first().fill(email);
await page.locator('input[type=password]').first().fill(pw);
await page.locator('button').filter({hasText:/log in|login|sign in/i}).first().click();
await page.waitForTimeout(8000); console.log('after',page.url(),await page.title());
console.log('body', (await page.locator('body').innerText()).slice(0,1000)); await page.screenshot({path:'qa-runs/spl-3286-u17-admin.png',fullPage:true});
await browser.close();