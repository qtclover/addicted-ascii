const {chromium}=require('C:/Users/addicteddd/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path'),url=require('url'),assert=require('assert/strict');
(async()=>{
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const out={};
for(const version of ['before','after']){
 const page=await browser.newPage({viewport:{width:393,height:852},deviceScaleFactor:3,hasTouch:true});
 await page.route('https://fonts.googleapis.com/**',r=>r.fulfill({contentType:'text/css',body:fs.readFileSync('audit/font.css')}));
 await page.route('https://fonts.gstatic.com/**',r=>r.fulfill({contentType:'font/woff2',body:fs.readFileSync('audit/instrument.woff2')}));
 await page.addInitScript(()=>{Object.defineProperty(document,'hasFocus',{value:()=>true});requestAnimationFrame=()=>0;});
 await page.goto(url.pathToFileURL(path.resolve(version==='before'?'audit/baseline.html':'index.html')).href);
 await page.waitForFunction(()=>typeof W!=='undefined'&&W>0);
 out[version]=await page.evaluate(()=>{
  P.autoQuality=false;enterAt=performance.now()-1e6;
  const bounds=()=>{drawSource(1.7);const a=P.tilt*Math.PI/180,rw=GW*1.03,rh=GH*.78,gap=Math.round(GH*.01);const pts=[[-GW/2,-GH/2],[GW/2,-GH/2],[-rw/2,GH/2+gap+rh],[rw/2,GH/2+gap+rh]].map(([x,y])=>({x:(LOCK.cx*W+x*Math.cos(a)-y*Math.sin(a))/DPX,y:(LOCK.cy*H+x*Math.sin(a)+y*Math.cos(a))/(H/vpH)}));return {top:Math.min(...pts.map(p=>p.y)),tail:Math.max(...pts.map(p=>p.y)),left:Math.min(...pts.map(p=>p.x)),right:Math.max(...pts.map(p=>p.x)),contacts:LINK_HITS.map(b=>({x:b.x/DPX,y:b.y/(H/vpH),w:b.w/DPX,h:b.h/(H/vpH)}))}};
  cv.style.height='746px';resize();const visible={vpW,vpH,W,H,...bounds()};
  const old=src,oldGrid=LUM;let calls=0;const rr=resize;resize=function(){calls++;rr()};requestAnimationFrame=cb=>{cb(performance.now());return 0};dispatchEvent(new Event('resize'));dispatchEvent(new Event('resize'));requestAnimationFrame=()=>0;resize=rr;
  const noOp={calls,retiles:Number(src!==old)+Number(LUM!==oldGrid)};
  const positions=LINK_HITS.map(b=>({x:b.x,y:b.y,w:b.w}));copyEls[1]._copied=performance.now();drawSource(1.7);const slots={neighborMove:LINK_HITS[0].x-positions[0].x,changedCenterMove:LINK_HITS[1].x+LINK_HITS[1].w/2-positions[1].x-positions[1].w/2};copyEls[1]._copied=-1e9;
  cv.style.height='852px';resize();const full=bounds();
  const breakpoints=[];for(const w of [799,800,801,800,799]){cv.style.width=w+'px';cv.style.height='1000px';resize();breakpoints.push({w,portrait:PORTRAIT,...bounds()})}
  cv.style.width='393px';cv.style.height='746px';resize();enterAt=performance.now()-1e6;setEmbellishment(true);frame(1.7);
  return {visible,noOp,slots,full,breakpoints};
 });
 await page.screenshot({path:`audit/${version}-phone-visible.png`});
 if(version==='after'){
  assert.equal(out.after.noOp.retiles,0);assert.equal(out.after.noOp.calls,2);assert.equal(out.after.slots.neighborMove,0);assert.equal(out.after.slots.changedCenterMove,0);assert.ok(out.after.visible.tail<746);
  await page.evaluate(()=>{entered=false;enterAt=0;gateEl.classList.remove('off');gateEl.removeAttribute('inert');linksEl.setAttribute('inert','');});
  await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'gate');
  await page.keyboard.press('Enter');await page.waitForFunction(()=>entered,null,{polling:50});
  assert.equal(await page.evaluate(()=>document.activeElement===copyEls[0]),true);
  const first=await page.evaluate(()=>enterAt);await page.evaluate(()=>enter());assert.equal(await page.evaluate(()=>enterAt),first);
  out.after.keyboard={entered:true,focusOnFirstContact:true,duplicateEntryIgnored:true,accessibleName:await page.locator('#gate').getAttribute('aria-label')};
  await page.evaluate(()=>{let undone=0;undoStep={undo:()=>undone++,rung:'cell'};reveal();window.auditUndone=undone;});assert.equal(await page.evaluate(()=>window.auditUndone),1);
 }
 await page.close();
}
console.log(JSON.stringify(out,null,2));fs.writeFileSync('audit/verification.json',JSON.stringify(out,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
