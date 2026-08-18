import { chromium } from 'playwright';
const base='https://staging-umbraco.splatdev.tech'; const b=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium-browser',args:['--no-sandbox','--disable-gpu']}); const c=await b.newContext(); const p=await c.newPage();
await p.goto(base+'/umbraco',{waitUntil:'domcontentloaded',timeout:60000}); await p.waitForTimeout(5000);
console.log('ids',await p.locator('#username-input, #password-input, button').count());
await p.locator('#username-input').fill(process.env.U17_STAGING_ADMIN_EMAIL); await p.locator('#password-input').fill(process.env.U17_STAGING_ADMIN_PASSWORD); await p.locator('button').filter({hasText:/log in|login|sign in/i}).first().click(); await p.waitForTimeout(10000);
console.log('url',p.url(),'cookies', (await c.cookies()).map(x=>x.name)); console.log('text',(await p.locator('body').innerText()).slice(0,500)); await p.screenshot({path:'qa-runs/spl-3286-u17-auth.png',fullPage:true}); await b.close();