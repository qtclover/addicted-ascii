(()=>{
const group=eval('('+buildGroup.toString().split('  GPAD = pad;')[0]+'return {fs,gw,gh,pad,font};})');
const gate=eval('('+gateArt.toString().split('  const glow =')[0]+'return {fs,font:m.font};})');
gateArtC=null;
const c=mk(1,1).getContext('2d');c.fillText=()=>{};c.strokeText=()=>{};syncLinkHits=()=>{};
const xheight=font=>{c.font=font;const m=c.measureText('x');return m.actualBoundingBoxAscent+m.actualBoundingBoxDescent};
const totals={},examples=[];
for(const family of ['desktop','phone'])for(const scale of [1,P.minScale])for(const pitch of [4,8]){
 const key=`${family} scale=${scale} pitch=${pitch}`,r={n:0,word:{x:Infinity},contact:{x:Infinity},gate:{x:Infinity},failWord:0,failContact:0,failGate:0};P.cellSize=pitch;
 for(let vw=family==='phone'?320:640;vw<=(family==='phone'?500:3840);vw+=family==='phone'?4:32)
 for(let vh=480;vh<=(family==='phone'?1100:2160);vh+=family==='phone'?4:32){
 if(family==='phone'&&(vh/vw<1.5||vh/vw>2.4))continue;
 for(const dpr of [family==='phone'?2:1,family==='phone'?3:2]){
  const pr=backingDpr(vw,vh,dpr,scale);if(pr<1){const k=snapDivisor(scale,Math.min(P.maxDpr||1,dpr));W=Math.max(320,Math.round(vw/k));H=Math.max(240,Math.round(vh/k))}else{W=Math.max(320,vw*pr|0);H=Math.max(240,vh*pr|0)}
  PORTRAIT=vw/vh<PORTRAIT_AT;DPX=W/vw;const g=group();GW=g.gw;GH=g.gh;GPAD=g.pad;
  LOCK.cx=PORTRAIT?.5:(W*(1-P.marginX)-GW/2+GPAD)/W;
  LOCK.cy=PORTRAIT?.4:(H*(1-P.marginY)-(GH/2+Math.round(GH*.01)+GH*.78)+GPAD)/H;
  LOCK.w=GW/W;LOCK.h=GH/H;LOCK.floor=(LOCK.cy*H+GH/2+Math.round(GH*.01)+GH*.78)/H;
  const fonts=[];c.fillText=function(t){if(t==='discord')fonts.push(this.font)};drawLinks(c);
  const ga=gate(),xs={word:xheight(g.font)/pitch,contact:xheight(fonts[0])/pitch,gate:xheight(ga.font)/pitch};r.n++;
  for(const k of Object.keys(xs)){if(xs[k]<r[k].x)r[k]={x:xs[k],vw,vh,dpr,W,H,font:k==='word'?g.font:k==='contact'?fonts[0]:ga.font};if(xs[k]<6)r['fail'+k[0].toUpperCase()+k.slice(1)]++}
  if(pitch===4&&((vw===640&&vh===480)||(vw===320&&vh===568)))examples.push({key,vw,vh,dpr,...xs});
 }
 }
 totals[key]=r;
}
return {totals,examples};
})()
