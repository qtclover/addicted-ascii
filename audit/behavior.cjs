const {chromium}=require('C:/Users/addicteddd/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path'),url=require('url'),assert=require('assert/strict');
(async()=>{
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const out={};
for(const which of ['late-font','late-css','touch']){
 const page=await browser.newPage({viewport:{width:1440,height:900},hasTouch:true});
 await page.addInitScript(()=>{Object.defineProperty(document,'hasFocus',{value:()=>true});requestAnimationFrame=()=>0;});
 let release;const hold=new Promise(r=>release=r);
 await page.route('https://fonts.googleapis.com/**',async r=>{if(which==='late-css')await hold;await r.fulfill({contentType:'text/css',body:fs.readFileSync('audit/font.css')})});
 await page.route('https://fonts.gstatic.com/**',async r=>{if(which==='late-font')await hold;await r.fulfill({contentType:'font/woff2',body:fs.readFileSync('audit/instrument.woff2')})});
 await page.goto(url.pathToFileURL(path.resolve(process.argv[2]||'index.html')).href,{waitUntil:'commit'});
 await new Promise(r=>setTimeout(r,2100));
 const before=await page.evaluate(()=>{if(typeof W==='undefined')return {booted:false};if(W){enterAt=performance.now()-1e6;frame(1.7)}return {booted:W>0,font:FONT_OK,group:GW,backing:W};});
 release();await page.waitForLoadState('load');await new Promise(r=>setTimeout(r,300));
 const after=await page.evaluate(()=>{enterAt=performance.now()-1e6;frame(1.7);return {booted:W>0,font:FONT_OK,group:GW,backing:W}});
 out[which]={before,after};
 if(which==='touch'){
  await page.evaluate(()=>{reveal();enterAt=performance.now()-1e6;frame(1.7);});
  const el=page.locator('.copy').first();await el.tap();
  out.touch.afterTap=await page.evaluate(()=>({hot:copyEls[0]._hot,focused:document.activeElement===copyEls[0]}));
  await page.evaluate(()=>copyEls[0].dispatchEvent(new PointerEvent('pointercancel',{pointerType:'touch'})));
  out.touch.afterCancel=await page.evaluate(()=>copyEls[0]._hot);
 }
 await page.close();
}
if(!process.argv[2]||process.argv[2]==='index.html'){
 for(const k of ['late-font','late-css']){assert.equal(out[k].before.booted,true);assert.equal(out[k].before.group,out[k].after.group);assert.equal(out[k].after.font,false)}
 assert.equal(out.touch.afterTap.hot,false);assert.equal(out.touch.afterCancel,false);
}
console.log(JSON.stringify(out,null,2));fs.writeFileSync(process.argv[3]||'audit/behavior.json',JSON.stringify(out,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
