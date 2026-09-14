const {chromium}=require('C:/Users/addicteddd/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--disable-frame-rate-limit','--disable-gpu-vsync']});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.route('https://fonts.googleapis.com/**',r=>r.fulfill({contentType:'text/css',body:fs.readFileSync('audit/font.css')}));
 await page.route('https://fonts.gstatic.com/**',r=>r.fulfill({contentType:'font/woff2',body:fs.readFileSync('audit/instrument.woff2')}));
 await page.addInitScript(()=>{Object.defineProperty(document,'hasFocus',{value:()=>true});window.requestAnimationFrame=()=>0;});
 await page.goto(require('url').pathToFileURL(path.resolve(process.argv[4]||'index.html')).href,{timeout:120000});
 await page.waitForFunction(()=>typeof W!=='undefined'&&W>0&&FONT_OK,{},{timeout:20000});
 const result=await page.evaluate(fs.readFileSync(process.argv[2]||'audit/probe.js','utf8'));
 console.log(JSON.stringify(result,null,2));fs.writeFileSync(process.argv[3]||'audit/probe.json',JSON.stringify(result,null,2));
 await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
