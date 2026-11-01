'use client';
import {useEffect,useRef} from 'react';import {FLAME} from './flame';import {isPhone,hexGrid,flameGrid} from './grid';
export default function VentureDots({kind,text,color,className,svg,pal:PAL,accent}:{kind:'flame'|'text'|'hv'|'svg';text?:string;color:string;className?:string;svg?:string;pal?:string[];accent?:string}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const cv=ref.current!;const ctx=cv.getContext('2d')!;let W=0,H=0,dpr=1,raf=0,start=-1,vis=false;let P:{x:number,y:number,sx:number,sy:number,ph:number,r:number,c?:string}[]=[];let CS:string[]=[];let DR=0;
  const rnd=(()=>{let s=9;return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646}})();
  const build=async()=>{const ph=isPhone();dpr=Math.min(ph?3:2,devicePixelRatio||1);const b=cv.getBoundingClientRect();W=b.width;H=b.height;cv.width=W*dpr;cv.height=H*dpr;
   let pts:number[]=[];CS=[];DR=0;const n=Math.round(Math.min(2200,W*H/70));
   if(kind==='hv'||kind==='svg'){const S=Math.min(W,H)*.98,ox=(W-S)/2,oy=(H-S)/2;
    const svg0=kind==='svg'?svg!.replace('<svg ',`<svg width="${S}" height="${S}" `):`<svg xmlns="http://www.w3.org/2000/svg" viewBox="5 5 38 38" width="${S}" height="${S}"><defs><radialGradient id="c" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#C9D3FF"/></radialGradient></defs><ellipse cx="24" cy="24" rx="16.5" ry="7.5" fill="none" stroke="#b7c0ff" stroke-width="1.5" transform="rotate(-24 24 24)"/><circle cx="24" cy="24" r="6.2" fill="url(#c)"/><circle cx="37.6" cy="17.9" r="3.3" fill="#F2C063"/><circle cx="10.4" cy="30.1" r="3.3" fill="#34C77B"/><circle cx="17.4" cy="14.6" r="2.6" fill="#F2A77E"/></svg>`;
    const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg0);await img.decode();
    const c=document.createElement('canvas');c.width=Math.ceil(S);c.height=Math.ceil(S);const x=c.getContext('2d')!;x.drawImage(img,0,0,S,S);const d=x.getImageData(0,0,c.width,c.height).data;
    if(ph){const g=hexGrid((X,Y)=>X>=0&&Y>=0&&X<c.width&&Y<c.height&&d[(Y*c.width+X)*4+3]>140,c.width,c.height,Math.round(Math.min(2600,W*H/34)));DR=1.15;for(let i=0;i<g.length;i+=2){const q=(g[i+1]*c.width+g[i])*4;pts.push(ox+g[i],oy+g[i+1]);CS.push(`rgb(${d[q]},${d[q+1]},${d[q+2]})`)}}else{const all:number[]=[];for(let yy=0;yy<c.height;yy+=2)for(let xx=0;xx<c.width;xx+=2){const q=(yy*c.width+xx)*4;if(d[q+3]>140)all.push(xx,yy)}const m=all.length/2;const nn=Math.round(Math.min(4200,W*H/(kind==='svg'?80:38)));
    for(let i=0;i<nn;i++){const j=Math.floor(rnd()*m);const xx=all[j*2]+(rnd()-.5)*2,yy=all[j*2+1]+(rnd()-.5)*2;const q=(all[j*2+1]*c.width+all[j*2])*4;pts.push(ox+xx,oy+yy);CS.push(`rgb(${d[q]},${d[q+1]},${d[q+2]})`)}}}
   else if(kind==='flame'){const nf=FLAME.length/2,sz=Math.min(W,H)*.86;const pal=PAL||['#E04416'];if(ph){const g=flameGrid(Math.round(Math.min(1800,W*H/40)));DR=1.15;for(let i=0;i<g.length;i+=2){pts.push(W/2+g[i]*sz,H/2-g[i+1]*sz);CS.push(pal[(i/2)%4])}}else for(let i=0;i<n;i++){const j=i%nf;pts.push(W/2+FLAME[j*2]*sz,H/2-FLAME[j*2+1]*sz);CS.push(pal[i%4])}}
   else{await document.fonts.ready;const el=document.querySelector('.disp');const fam=el?getComputedStyle(el).fontFamily:'sans-serif';const c=document.createElement('canvas');c.width=Math.round(W);c.height=Math.round(H);const x=c.getContext('2d')!;let fs=H*.8;x.font=`700 ${fs}px ${fam}`;const mw=x.measureText(text||'').width;if(mw>W*.9){fs*=W*.9/mw;x.font=`700 ${fs}px ${fam}`}x.textAlign='center';x.textBaseline='middle';x.fillText(text||'',W/2,H/2+fs*.05);
    const d=x.getImageData(0,0,c.width,c.height).data;const all:number[]=[];for(let yy=0;yy<c.height;yy+=2)for(let xx=0;xx<c.width;xx+=2)if(d[(yy*c.width+xx)*4+3]>128)all.push(xx,yy);if(ph){const g=hexGrid((X,Y)=>X>=0&&Y>=0&&X<c.width&&Y<c.height&&d[(Y*c.width+X)*4+3]>128,c.width,c.height,n);DR=1.1;pts.push(...g)}else{const m=all.length/2;const idx=Array.from({length:m},(_,q)=>q);for(let q=m-1;q>0;q--){const r=Math.floor(rnd()*(q+1));[idx[q],idx[r]]=[idx[r],idx[q]]}for(let i=0;i<n;i++){const j=idx[i%m];pts.push(all[j*2],all[j*2+1])}}}
   if(accent){const L=pts.length/2;for(let i=0;i<L;i++){if(!CS[i])CS[i]=color;if(i%11===0)CS[i]=accent}}
   P=[];for(let i=0;i<pts.length/2;i++)P.push({x:pts[i*2],y:pts[i*2+1],sx:(rnd()-.5)*W*1.6+W/2,sy:(rnd()-.5)*H*1.6+H/2,ph:rnd()*6.28,r:DR?DR:.7+rnd()*.9,c:CS[i]})};
  const ez=(k:number)=>1-Math.pow(1-k,3);
  const draw=(t:number)=>{raf=requestAnimationFrame(draw);if(!vis)return;if(start<0)start=t;const k=ez(Math.min(1,(t-start)/1800));ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);ctx.fillStyle=color;
   for(const p of P){const x=p.sx+(p.x-p.sx)*k+Math.sin(t*.0008+p.ph)*(DR?.25:.8),y=p.sy+(p.y-p.sy)*k+Math.cos(t*.0007+p.ph)*(DR?.25:.8);ctx.globalAlpha=.35+.65*k;if(p.c)ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(x,y,p.r,0,6.283);ctx.fill()}};
  const io=new IntersectionObserver(([e])=>{vis=e.isIntersecting;if(vis&&start<0)start=-1},{threshold:.25});
  build().then(()=>{io.observe(cv);raf=requestAnimationFrame(draw)});
  let tm:any;const onR=()=>{clearTimeout(tm);tm=setTimeout(()=>{build()},200)};addEventListener('resize',onR);
  return()=>{cancelAnimationFrame(raf);io.disconnect();removeEventListener('resize',onR)}},[kind,text,color]);
 return <canvas ref={ref} aria-hidden className={className}/>}
