const {chromium}=require('C:/Users/addicteddd/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path'),url=require('url');
(async()=>{
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--disable-frame-rate-limit','--disable-gpu-vsync']});const out=[];
for(const version of ['before','after'])for(const [width,height,dpr,scale,requested] of [[1440,900,1,1,4],[800,600,1,1,4],[393,852,3,1,4],[640,480,1,.5,8]]){
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr});
 await page.route('https://fonts.googleapis.com/**',r=>r.fulfill({contentType:'text/css',body:fs.readFileSync('audit/font.css')}));
 await page.route('https://fonts.gstatic.com/**',r=>r.fulfill({contentType:'font/woff2',body:fs.readFileSync('audit/instrument.woff2')}));
 await page.addInitScript(()=>{Object.defineProperty(document,'hasFocus',{value:()=>true});window.auditRaf=requestAnimationFrame.bind(window);requestAnimationFrame=()=>0;});
 await page.goto(url.pathToFileURL(path.resolve(version==='before'?'audit/baseline.html':'index.html')).href);await page.waitForFunction(()=>typeof W!=='undefined'&&W>0);
 const result=await page.evaluate(async({scale,requested})=>{
  P.autoQuality=false;P.pauseWhenIdle=false;renderScale=scale;P.cellSize=requested;resize();reveal();enterAt=performance.now()-1e6;
  const intervals=[],cpu=[];let previous=0,n=0;
  await new Promise(resolve=>{const tick=now=>{const t=performance.now();frame(1.7+n/60);const ms=performance.now()-t;if(n>60){intervals.push(now-previous);cpu.push(ms)}previous=now;if(++n<181)auditRaf(tick);else resolve()};auditRaf(tick)});
  const sorted=[...intervals].sort((a,b)=>a-b),mean=intervals.reduce((a,b)=>a+b)/intervals.length;
  return {W,H,cols,rows,pitch:typeof cellPx==='undefined'?P.cellSize:cellPx,meanMs:mean,p50:sorted[Math.floor(sorted.length*.5)],p95:sorted[Math.floor(sorted.length*.95)],scriptMs:cpu.reduce((a,b)=>a+b)/cpu.length,frames:intervals.length};
 },{scale,requested});out.push({version,width,height,dpr,scale,requested,...result});console.log(JSON.stringify(out.at(-1)));await page.close();
}
fs.writeFileSync('audit/performance.json',JSON.stringify(out,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
