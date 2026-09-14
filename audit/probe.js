(()=>{
P.autoQuality=false;enterAt=performance.now()-1e6;
const real=measureViewport, out=[];
for(const [w,h] of [[1440,900],[800,600],[1280,720],[393,852]]) {
 measureViewport=()=>{vpW=w;vpH=h};resize();
 const calls=[],fill=sctx.fillText;
 sctx.fillText=function(t,x,y){const m=this.measureText(t);calls.push({t,x,y,font:this.font,width:m.width,left:m.actualBoundingBoxLeft,right:m.actualBoundingBoxRight,asc:m.actualBoundingBoxAscent,desc:m.actualBoundingBoxDescent});return fill.apply(this,arguments)};
 frame(1.7);sctx.fillText=fill;
 const b=LINK_HITS[0];const ry0=b.y|0,ry1=(b.y+b.h)|0,strip=sctx.getImageData(0,ry0,W,ry1-ry0).data;let first=-1;
 for(let x=0;x<W&&first<0;x++)for(let y=0;y<ry1-ry0;y++)if(strip[(y*W+x)*4]>40){first=x;break}
 const bounds=[Math.max(0,(first/P.cellSize)|0),Math.ceil((b.x-P.cellSize)/P.cellSize),Math.max(0,(b.y/P.cellSize)|0),Math.min(rows,Math.ceil((b.y+b.h)/P.cellSize))];
 let n=0,lit=0,max=0,sum=0;for(let y=bounds[2];y<bounds[3];y++)for(let x=bounds[0];x<bounds[1];x++){const l=LUM[y*cols+x];n++;sum+=l;max=Math.max(max,l);if(l>.18)lit++}
 out.push({w,h,W,H,calls,b:{x:b.x,y:b.y,w:b.w,h:b.h},first,bounds,n,lit,max,mean:sum/n,pct:lit/n*100});
}
measureViewport=real;resize();return out;
})()
