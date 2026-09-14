(()=>{
P.autoQuality=false;enterAt=performance.now()-1e6;
const original=drawLinks.toString();
drawLinks=eval('('+original.replace('Math.max(...copyEls.map(slotOf)) / 100','(wide("[ ") + Math.max(...copyEls.map(slotOf)) + wide(" ]")) / 100').replace('rows = copyEls.map(el => [{ t: label(el), el }]);','rows = copyEls.map(el => [{ t: "[ " }, { t: label(el), el }, { t: " ]" }]);')+')');
const real=measureViewport,out=[];
for(const stroke of [0,0.4,0.6,0.8,1])for(const [w,h] of [[1440,900],[800,600],[1280,720],[786,1704]]){
 measureViewport=()=>{vpW=w;vpH=h};resize();const fill=sctx.fillText;
 sctx.fillText=function(t,x,y){fill.apply(this,arguments);if(t.includes('[')||t.includes(']')||t.includes('|')){this.lineWidth=stroke;this.strokeStyle=this.fillStyle;if(stroke)this.strokeText(t,x,y)}};
 frame(1.7);sctx.fillText=fill;
 const b=LINK_HITS[0],ry0=b.y|0,ry1=(b.y+b.h)|0,strip=sctx.getImageData(0,ry0,W,ry1-ry0).data;let first=-1;
 for(let x=0;x<W&&first<0;x++)for(let y=0;y<ry1-ry0;y++)if(strip[(y*W+x)*4]>40){first=x;break}
 let n=0,lit=0,sum=0,wn=0,ws=0;
 for(let y=Math.max(0,b.y/4|0);y<Math.min(rows,Math.ceil((b.y+b.h)/4));y++){
 for(let x=Math.max(0,first/4|0);x<Math.min(cols,Math.ceil((b.x-4)/4));x++){const l=LUM[y*cols+x];n++;sum+=l;if(l>.18)lit++}
 for(let x=Math.max(0,b.x/4|0);x<Math.min(cols,Math.ceil((b.x+b.w)/4));x++){ws+=LUM[y*cols+x];wn++}}
 out.push({stroke,w,h,fs:b.h/1.3,pct:lit/n*100,mean:sum/n,word:ws/wn,pass:lit/n>=.09&&sum/n<ws/wn*.6});
}
measureViewport=real;resize();return out;
})()
