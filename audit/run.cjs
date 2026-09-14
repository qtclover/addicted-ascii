const {chromium} = require('C:/Users/addicteddd/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const {pathToFileURL} = require('url');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--disable-frame-rate-limit','--disable-gpu-vsync']});
 const results=[];
 for(const [width,height,dpr] of [[1440,900,1],[800,600,1],[1280,720,1],[393,852,3]]){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:dpr});
  await context.route('https://fonts.googleapis.com/**',r=>process.argv[2]==='offline'?r.abort():r.fulfill({contentType:'text/css',body:fs.readFileSync('audit/font.css')}));
  await context.route('https://fonts.gstatic.com/**',r=>process.argv[2]==='offline'?r.abort():r.fulfill({contentType:'font/woff2',body:fs.readFileSync('audit/instrument.woff2')}));
  await context.addInitScript(()=>{Object.defineProperty(document,'hasFocus',{value:()=>true});window.requestAnimationFrame=()=>0;});
  const page=await context.newPage(); const logs=[];
  page.on('console',m=>logs.push({type:m.type(),text:m.text()}));page.on('pageerror',e=>logs.push({type:'pageerror',text:e.message}));
  await page.goto(pathToFileURL(path.resolve('index.html')).href+'?selftest',{timeout:120000});
  for(let n=0;n<1200 && !logs.some(m=>m.text.includes('SELFTEST'));n++) await new Promise(r=>setTimeout(r,100));
  const state=await page.evaluate(()=>({hud:hud.textContent,FONT_OK,W,H,cols,rows,cell:P.cellSize,pitch:typeof cellPx==='undefined'?P.cellSize:cellPx,fonts:[...document.fonts].map(f=>({family:f.family,status:f.status})),entered}));
  await page.evaluate(()=>{P.autoQuality=false;P.pauseWhenIdle=false;enterAt=performance.now()-1e6;frame(1.7)});
  await page.screenshot({path:`audit/${process.argv[2]||'before'}-${width}x${height}.png`});
  const bracket=await page.evaluate(()=>{
   const cs=typeof cellPx==='undefined'?P.cellSize:cellPx,b=LINK_HITS[0],y0=b.y|0,y1=(b.y+b.h)|0,strip=sctx.getImageData(0,y0,W,y1-y0).data;let first=-1;
   for(let x=0;x<W&&first<0;x++)for(let y=0;y<y1-y0;y++)if(strip[(y*W+x)*4]>40){first=x;break}
   let n=0,lit=0,sum=0,ws=0,wn=0;for(let y=Math.max(0,b.y/cs|0);y<Math.min(rows,Math.ceil((b.y+b.h)/cs));y++){
    for(let x=Math.max(0,first/cs|0);x<Math.min(cols,Math.ceil((b.x-cs)/cs));x++){const l=LUM[y*cols+x];n++;sum+=l;if(l>.18)lit++}
    for(let x=Math.max(0,b.x/cs|0);x<Math.min(cols,Math.ceil((b.x+b.w)/cs));x++){ws+=LUM[y*cols+x];wn++}}
   return {pct:100*lit/Math.max(1,n),mean:sum/Math.max(1,n),word:ws/wn};
  });
  results.push({width,height,dpr,state,bracket,logs});console.log(JSON.stringify(results.at(-1)));
  fs.writeFileSync(`audit/${process.argv[2]||'baseline'}.json`,JSON.stringify(results,null,2));await context.close();
  if(!logs.some(m=>m.text.includes('SELFTEST PASS'))||logs.some(m=>m.type==='pageerror'||m.text.startsWith('FAIL')))process.exitCode=1;
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
