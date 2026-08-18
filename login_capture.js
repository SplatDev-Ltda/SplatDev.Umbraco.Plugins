const {chromium}=require('playwright');
(async()=>{const b=await chromium.connectOverCDP(process.env.PAPERCLIP_BROWSER_CDP_ENDPOINT);const p=b.contexts()[0].pages()[0];await p.waitForTimeout(1000);console.log((await p.locator('body').innerText()).slice(0,3000));console.log(await p.locator('*').evaluateAll(xs=>xs.filter(x=>x.shadowRoot).map(x=>x.tagName)));await b.close()})()
