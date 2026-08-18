const {chromium}=require('playwright'); const ep=process.env.PAPERCLIP_BROWSER_CDP_ENDPOINT;
(async()=>{const b=await chromium.connectOverCDP(ep);const p=b.contexts()[0].pages()[0];
async function cap(label,url){await p.goto(url);await p.waitForTimeout(2500);console.log('--'+label,p.url());console.log((await p.locator('body').innerText()).slice(0,3000));await p.screenshot({path:'qa-runs/'+label+'.png',fullPage:true});}
let base='https://staging-umbraco.splatdev.tech/umbraco/section/email-templates';
await cap('01-templates',base); await cap('02-style',base+'/menu/email-style'); await cap('03-template-create',base+'/workspace/email-template/create'); await cap('04-preview',base+'/workspace/email-template/preview'); await b.close();})();
