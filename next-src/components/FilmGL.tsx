'use client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';import {useEffect,useMemo,useRef,useState} from 'react';import * as THREE from 'three';import {FLAME} from './flame';import {isPhone,hexGrid,flameGrid} from './grid';
const NI=150,H=8;const QP=(k:string)=>typeof location!=='undefined'?new URLSearchParams(location.search).get(k):null;const RG=Number(QP('ring'))||0,GL=QP('globe')!==null?Number(QP('globe')):2;const PV=typeof location!=='undefined'?(new URLSearchParams(location.search).get('pv')!==null?Number(new URLSearchParams(location.search).get('pv')):(isPhone()?4:0)):0;
const rnd=(a:number)=>{let s=a;return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646}};
type An={x:number,y:number,r:number}[][];
function build(asp:number,N:number,an:An){
 const R=rnd(7),W=H*asp;const T:Float32Array[]=[];const mk=()=>new Float32Array(N*3);const m=asp<.8;
 const sphere=(arr:Float32Array,i:number,rad:number,cx:number,cy:number)=>{const u=R()*2-1,t=R()*Math.PI*2,q=Math.sqrt(1-u*u),k=rad*(.55+.45*Math.cbrt(R()));arr[i*3]=cx+q*Math.cos(t)*k;arr[i*3+1]=cy+u*k;arr[i*3+2]=q*Math.sin(t)*k};
 const ringPt=(arr:Float32Array,i:number,rad:number,spread:number)=>{const t=R()*Math.PI*2,k=rad+(R()-.5)*spread;arr[i*3]=Math.cos(t)*k;arr[i*3+1]=Math.sin(t)*k*.92;arr[i*3+2]=(R()-.5)*1.2};
 const wide=asp<1?.62:1,gx=Math.min(4.6,W*.28);
 let a=mk();for(let i=0;i<N;i++){const Q=an[0]&&an[0][0];if(Q){sphere(a,i,Q.r,Q.x,Q.y)}else if(m){sphere(a,i,2.6,0,0)}else{a[i*3]=(R()-.5)*W*1.1;a[i*3+1]=(R()-.5)*H*1.1;a[i*3+2]=(R()-.5)*3}}T.push(a);
 const sc=mk();for(let i=0;i<N;i++){sc[i*3]=(R()-.5)*W*1.3;sc[i*3+1]=(R()-.5)*H*1.3;sc[i*3+2]=(R()-.5)*9}
 a=sc;{const Q=an[1]&&an[1][0];if(Q&&typeof document!=='undefined'){const el=document.querySelector('.disp');const fam=el?getComputedStyle(el).fontFamily:'sans-serif';const cw=800,ch=480,cv=document.createElement('canvas');cv.width=cw;cv.height=ch;const x=cv.getContext('2d')!;x.font=`700 470px ${fam}`;x.textAlign='center';x.textBaseline='middle';x.fillText('AI',cw/2,ch/2+20);
  const d=x.getImageData(0,0,cw,ch).data;const pts:number[]=[];for(let yy=0;yy<ch;yy+=3)for(let xx=0;xx<cw;xx+=3)if(d[(yy*cw+xx)*4+3]>128)pts.push(xx,yy);if(PV>=4&&m){const g=hexGrid((X,Y)=>X>=0&&Y>=0&&X<cw&&Y<ch&&d[(Y*cw+X)*4+3]>128,cw,ch,Math.floor(N*.8));pts.length=0;pts.push(...g)}const n=pts.length/2;let cc=0;
  if(n>50){let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(let q=0;q<n;q++){x0=Math.min(x0,pts[q*2]);x1=Math.max(x1,pts[q*2]);y0=Math.min(y0,pts[q*2+1]);y1=Math.max(y1,pts[q*2+1])}
   const sx=(x1-x0),sy=(y1-y0),k=Math.min(Q.r*2*1.7/sx,Q.r*2/sy);a=mk();const idx=Array.from({length:n},(_,q)=>q);for(let q=n-1;q>0;q--){const r=Math.floor(R()*(q+1));[idx[q],idx[r]]=[idx[r],idx[q]]}
   for(let i=0;i<N;i++){if(i%6===0){a[i*3]=sc[i*3];a[i*3+1]=sc[i*3+1];a[i*3+2]=sc[i*3+2]*.4-2;continue}if(PV>=4&&m&&cc>=n){a[i*3]=sc[i*3];a[i*3+1]=sc[i*3+1];a[i*3+2]=sc[i*3+2]*.4-4;continue}const j=PV>=4&&m?idx[cc++]:idx[i%n];a[i*3]=Q.x+(pts[j*2]-(x0+x1)/2)*k+(PV>=4&&m?0:(R()-.5)*.01);a[i*3+1]=Q.y-(pts[j*2+1]-(y0+y1)/2)*k;a[i*3+2]=PV>=4&&m?0:(R()-.5)*.1}}}}
 T.push(a);(T as any).sc=sc;
 a=mk();for(let i=0;i<N;i++){ringPt(a,i,3.4+(i%5)*.34,.12)}for(let i=0;i<N;i++){a[i*3]*=wide*1.35;a[i*3+1]*=wide*1.1}
 if(m&&PV>=4&&RG){const rx=W*.47,ry=Math.min(3.3,rx*1.75);const P:number[]=[];if(RG===1){for(const [sc2,c] of [[1,150],[.93,140],[.86,130]]){for(let k=0;k<c;k++){const t=k/c*6.2832;const yy=Math.sin(t)*ry*sc2;if(yy>-1.45&&yy<1.55)continue;P.push(Math.cos(t)*rx*sc2,yy)}}}else{const st=.12;let row=0;for(let y=-ry;y<=ry;y+=st*.866,row++)for(let x=-rx+(row%2)*st/2;x<=rx;x+=st){const e=(x/rx)**2+(y/ry)**2;if(e<=1&&e>=.72&&(y<=-1.45||y>=1.55))P.push(x,y)}}
  const n=P.length/2,id=Array.from({length:N},(_,q)=>q);for(let q=N-1;q>0;q--){const r=Math.floor(R()*(q+1));[id[q],id[r]]=[id[r],id[q]]}for(let k=0;k<N;k++){const i=id[k];if(k>=n&&k<n+260){a[i*3]=(R()-.5)*W*1.2;a[i*3+1]=(R()-.5)*H*1.2;a[i*3+2]=-7-R()*3;continue}const j=k%n;a[i*3]=P[j*2];a[i*3+1]=P[j*2+1];a[i*3+2]=0}}
 T.push(a);
 const fromA=(j:number,fb:(a:Float32Array,i:number)=>void)=>{const a=mk(),L=an[j];for(let i=0;i<N;i++){if(L&&L.length){const q=L[i%L.length];sphere(a,i,q.r,q.x,q.y)}else fb(a,i)}T.push(a)};
 fromA(3,(a,i)=>{const c=i%3;sphere(a,i,m?.85:1.75,m?-1.05:(c-1)*gx*1.15,m?(1-c)*2.6:1.1)});
 a=mk();if(m&&PV>=4&&GL){const NF=GL===2?600:340,fs2=GL===2?1.25:1.05,g=flameGrid(NF),ng=g.length/2;const SP:number[]=[];const K=GL===2?900:N-NF;for(let k=0;k<K;k++){const u=1-2*(k+.5)/K,th=k*2.39996,q=Math.sqrt(1-u*u),x=q*Math.cos(th),y=u,z=q*Math.sin(th);if(z>Math.cos(.62*fs2)&&Math.abs(x)<.5*fs2&&Math.abs(y)<.62*fs2)continue;SP.push(x,y,z)}const ns=SP.length/3;const G=an[4]&&an[4][0];const gr=G?G.r:1.7,cx=G?G.x:0,cy=G?G.y:2.1;
  for(let i=0;i<N;i++){let x,y,z;if(i<NF){const j=i%ng;const th=g[j*2]*fs2,ph=g[j*2+1]*fs2;x=Math.sin(th)*Math.cos(ph);y=Math.sin(ph);z=Math.cos(th)*Math.cos(ph)}else{const j=(i-NF)%ns;x=SP[j*3];y=SP[j*3+1];z=SP[j*3+2]}a[i*3]=x*gr+cx;a[i*3+1]=y*gr+cy;a[i*3+2]=z*gr}T.push(a)}else{
 for(let i=0;i<N;i++){let x,y,z;const NF=m?340:820;if(i<NF){const j=(i*7)%(FLAME.length/2);const th=FLAME[j*2]*1.05,ph=FLAME[j*2+1]*1.05;x=Math.sin(th)*Math.cos(ph);y=Math.sin(ph);z=Math.cos(th)*Math.cos(ph)}else{do{const u=R()*2-1,t=R()*Math.PI*2,q=Math.sqrt(1-u*u);x=q*Math.cos(t);y=u;z=q*Math.sin(t)}while(z>Math.cos(.62)&&Math.abs(x)<.5&&Math.abs(y)<.62)}const G=an[4]&&an[4][0];const g=G?G.r:(m?1.7:3.2);a[i*3]=x*g+(G?G.x:(m?0:gx*.85));a[i*3+1]=y*g+(G?G.y:(m?2.1:0));a[i*3+2]=z*g}T.push(a)}
 fromA(5,(a,i)=>{const c=i%2;sphere(a,i,m?.6:1.9,m?-1.3:(c?1:-1)*gx*1.25,m?(c?-1.9:1.9):1.0)});
 fromA(6,(a,i)=>{const c=i%4;if(m)sphere(a,i,.5,-1.3,(1.5-c)*2);else sphere(a,i,.7,(c%2?1:-1)*gx*.95,c<2?3.0:.5)});
 const FIN=Number(new URLSearchParams(location.search).get('fin'))||4;a=mk();if(FIN===4){const rr=m?2.4:3.3;for(let i=0;i<N;i++){const u=(i+.5)/N*2-1,th=i*2.39996,q=Math.sqrt(1-u*u);a[i*3]=q*Math.cos(th)*rr;a[i*3+1]=u*rr+(m?.2:0);a[i*3+2]=q*Math.sin(th)*rr}}else{for(let i=0;i<N;i++){ringPt(a,i,3.9+(i%6)*.3,.1)}for(let i=0;i<N;i++){a[i*3]*=wide*1.3;a[i*3+1]*=wide*1.05}}T.push(a);
 return T}
const vs=`attribute float aS;attribute vec3 aC;varying vec3 vC;varying float vA;uniform float uD;
void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=aS*uD*26./(-mv.z);vC=aC;vA=clamp(1.-(-mv.z-8.)/16.,.25,1.);}`;
const fs=`varying vec3 vC;varying float vA;uniform float uO;void main(){vec2 c=gl_PointCoord-.5;float d=length(c);if(d>.5)discard;gl_FragColor=vec4(vC,smoothstep(.5,${PV?'.42':'.28'},d)*uO*vA);}`;
const HV=2*12*Math.tan(20*Math.PI/180);
function measure(stage:HTMLElement):An{const R=stage.getBoundingClientRect(),h=R.height,w=R.width,asp=w/h;const out:An=[];
 stage.querySelectorAll<HTMLElement>('.sc').forEach((sc,j)=>{const ty=new DOMMatrix(getComputedStyle(sc).transform).m42;
  out[j]=[...sc.querySelectorAll<HTMLElement>('[data-a]')].map(el=>{const r=el.getBoundingClientRect();const cx=r.left+r.width/2-R.left,cy=r.top+r.height/2-ty-R.top;
   return {x:(cx/w-.5)*HV*asp,y:(.5-cy/h)*HV,r:Math.min(r.width,r.height)/2/h*HV}}).filter(q=>q.r>0)});return out}
function Dots({prog,asp}:{prog:{current:number};asp:number}){
 const m=asp<.8,N=m?2200:3400;const {gl:g0,size}=useThree();const [an,setAn]=useState<An>([]);
 useEffect(()=>{const st=g0.domElement.closest('[data-stage]') as HTMLElement|null;if(!st)return;let t:any;const go=()=>{clearTimeout(t);t=setTimeout(()=>setAn(measure(st)),120)};go();document.fonts?.ready.then(go);const ro=new ResizeObserver(go);ro.observe(st);addEventListener('film-relayout',go);return()=>{removeEventListener('film-relayout',go);ro.disconnect();clearTimeout(t)}},[g0,size.width,size.height]);
 const T=useMemo(()=>build(asp,N,an),[asp,N,an]);
 const {geo,mat,cur,ph}=useMemo(()=>{const g=new THREE.BufferGeometry();const pos=new Float32Array(N*3),col=new Float32Array(N*3),s=new Float32Array(N),ph=new Float32Array(N*2);
  for(let i=0;i<N;i++){s[i]=i<NI?(m?(PV>=4?(PV===6?1.95:1.3):1.6):1.8):(m?(PV===6?1.95:PV>=4?1.3:PV>=3?1.45:PV>=2?1.2:1.05+Math.random()*.6):1+Math.random()*1.1);ph[i*2]=Math.random()*6.28;ph[i*2+1]=.3+Math.random()*.9}
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aC',new THREE.BufferAttribute(col,3));g.setAttribute('aS',new THREE.BufferAttribute(s,1));
  const mt=new THREE.ShaderMaterial({vertexShader:vs,fragmentShader:fs,transparent:true,depthWrite:false,uniforms:{uD:{value:1},uO:{value:.8}}});
  return {geo:g,mat:mt,cur:{p:0,dark:0},ph}},[N]);
 const grp=useRef<THREE.Points>(null);const {pointer,gl}=useThree();
 const HVv=useMemo(()=>Number(new URLSearchParams(location.search).get('hero'))||5,[]);const Hb=useMemo(()=>new Float32Array(N*3),[N]);const WD=useRef<Float32Array[]|null>(null);const heroRed=useRef(0);const sp=useRef({x:9,y:9});const moved=useRef(false);useEffect(()=>{const f=()=>{moved.current=true};addEventListener('pointermove',f,{once:true});return()=>removeEventListener('pointermove',f)},[]);
 useEffect(()=>{if(HVv!==5)return;let dead=false;document.fonts.ready.then(()=>{if(dead)return;const el=document.querySelector('.disp');const fam=el?getComputedStyle(el).fontFamily:'sans-serif';
  const cw=1600,ch=420,cv=document.createElement('canvas');cv.width=cw;cv.height=ch;const x=cv.getContext('2d')!;const ws=['Ventures.','Brands.','Solutions.'];
  let fs=300;x.font=`${PV>=3?700:600} ${fs}px ${fam}`;const mw=Math.max(...ws.map(w=>x.measureText(w).width));fs=Math.floor(fs*1500/mw);
  const Wt=HV*asp*(m?.92:.7);const R2=rnd(11);
  const fl=new Float32Array(N*3);if(PV>=4&&m){const g=flameGrid(Math.floor(N*.8)),ng=g.length/2,sz=2.6;let cc=0;for(let i=0;i<N;i++){if(i%9===0||cc>=ng){fl[i*3]=(R2()-.5)*HV*asp*1.2;fl[i*3+1]=(R2()-.5)*HV*1.2;fl[i*3+2]=-6-R2()*3;continue}fl[i*3]=g[cc*2]*sz;fl[i*3+1]=g[cc*2+1]*sz+.9;fl[i*3+2]=0;cc++}}else{const nf=FLAME.length/2,sz=m?2.6:3.6;for(let i=0;i<N;i++){const j=i%nf;fl[i*3]=FLAME[j*2]*sz+(R2()-.5)*.012;fl[i*3+1]=FLAME[j*2+1]*sz+(m?.9:.55);fl[i*3+2]=(R2()-.5)*.08}}
  WD.current=[fl,...ws.map(w=>{x.clearRect(0,0,cw,ch);x.font=`${PV>=3?700:600} ${fs}px ${fam}`;x.textAlign='center';x.textBaseline='middle';x.fillStyle='#000';x.fillText(w,cw/2,ch/2);
   const d=x.getImageData(0,0,cw,ch).data;const pts:number[]=[];for(let yy=0;yy<ch;yy+=2)for(let xx=0;xx<cw;xx+=2)if(d[(yy*cw+xx)*4+3]>128)pts.push(xx,yy);
   if(PV>=4&&m){const A=(X:number,Y:number)=>X>=0&&Y>=0&&X<cw&&Y<ch&&d[(Y*cw+X)*4+3]>128;const M=Math.floor(N*(PV===6?.42:PV===5?.6:.86));
    if(PV===5){const E:number[]=[];for(let yy=0;yy<ch;yy+=2)for(let xx=0;xx<cw;xx+=2)if(A(xx,yy)&&(!A(xx+5,yy)||!A(xx-5,yy)||!A(xx,yy+5)||!A(xx,yy-5)))E.push(xx,yy);const ne=E.length/2;const ord=Array.from({length:ne},(_,q)=>q);for(let q=ne-1;q>0;q--){const r=Math.floor(R2()*(q+1));[ord[q],ord[r]]=[ord[r],ord[q]]}
     const pd=(rr:number)=>{const g=new Map<number,number[]>();const out:number[]=[];for(const q of ord){const X=E[q*2],Y=E[q*2+1],gx=Math.floor(X/rr),gy=Math.floor(Y/rr);let ok=true;for(let a=-1;a<=1&&ok;a++)for(let b=-1;b<=1&&ok;b++){const L=g.get((gx+a)*9999+gy+b);if(L)for(let u=0;u<L.length;u+=2){const dx=L[u]-X,dy=L[u+1]-Y;if(dx*dx+dy*dy<rr*rr){ok=false;break}}}if(ok){out.push(X,Y);const k=gx*9999+gy;(g.get(k)||g.set(k,[]).get(k)!).push(X,Y)}}return out};
     let lo=2,hi=60,best:number[]=[];for(let it=0;it<14;it++){const mid=(lo+hi)/2,o2=pd(mid);if(o2.length/2>M)lo=mid;else{hi=mid;best=o2}}pts.length=0;pts.push(...best)}
    else{const gr=(st:number)=>{const o2:number[]=[];let row=0;for(let yy=st/2;yy<ch;yy+=st*.866,row++)for(let xx=(row%2)*st/2;xx<cw;xx+=st){const X=Math.round(xx),Y=Math.round(yy);if(A(X,Y))o2.push(X,Y)}return o2};let lo=2,hi=80,best:number[]=[];for(let it=0;it<16;it++){const mid=(lo+hi)/2,o2=gr(mid);if(o2.length/2>M)lo=mid;else{hi=mid;best=o2}}pts.length=0;pts.push(...best)}}
   else if(PV>=2&&m){const M=Math.floor(N*8/9);const st=2*Math.sqrt(pts.length/2/M)*.97;pts.length=0;for(let yy=st/2;yy<ch;yy+=st)for(let xx=(Math.round(yy/st)%2)*st/2;xx<cw;xx+=st){const X=Math.round(xx),Y=Math.round(yy);if(d[(Y*cw+X)*4+3]>128)pts.push(X,Y)}}
   const o=new Float32Array(N*3);const n=pts.length/2;const idx=Array.from({length:n},(_,q)=>q);for(let q=n-1;q>0;q--){const r=Math.floor(R2()*(q+1));[idx[q],idx[r]]=[idx[r],idx[q]]}let cc=0;for(let i=0;i<N;i++){if(PV>=4&&m){if(i%9===0||cc>=n){o[i*3]=(R2()-.5)*HV*asp*1.2;o[i*3+1]=(R2()-.5)*HV*1.2;o[i*3+2]=-6-R2()*3;continue}const j=idx[cc++];o[i*3]=(pts[j*2]/cw-.5)*Wt;o[i*3+1]=-(pts[j*2+1]/ch-.5)*Wt*ch/cw+.9;o[i*3+2]=0;continue}const j=idx[i%n];o[i*3]=(pts[j*2]/cw-.5)*Wt+(R2()-.5)*.012;o[i*3+1]=-(pts[j*2+1]/ch-.5)*Wt*ch/cw+(m?.9:.55);o[i*3+2]=(R2()-.5)*.08}return o})]})
  return()=>{dead=true}},[HVv,N,asp]);
 const heroAt=(t:number)=>{const S0=(T as any).sc as Float32Array;const ez=(k:number)=>k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;const cl=(v:number)=>Math.min(1,Math.max(0,v));
  if(HVv===5){const W=WD.current;if(!W)return S0;
   const cyc=3.6,tt=Math.max(0,t-2.2),n=W.length;const k=Math.floor(tt/cyc)%n,ff=ez(cl((tt%cyc-2.4)/1.2)),ii=ez(cl(t/2.2));const P=W[k],Q=W[(k+1)%n];
   heroRed.current=t<2.2?ii:(k===0?1-ff:(k+1)%n===0?ff:0);
   const px=sp.current.x*HV*asp/2,py=sp.current.y*HV/2,vw=HV*asp;
   for(let i=0;i<N;i++){const j=i*3;
    if(i%9===0){Hb[j]=((S0[j]/ (vw*1.3)+.5+t*.006*(1+(i%7)*.1))%1-.5)*vw*1.15;Hb[j+1]=S0[j+1]*.9+Math.sin(t*.3+i)*.08;Hb[j+2]=S0[j+2]*.5-2;continue}
    let x=t<2.2?S0[j]+(W[0][j]-S0[j])*ii:P[j]+(Q[j]-P[j])*ff,y=t<2.2?S0[j+1]+(W[0][j+1]-S0[j+1])*ii:P[j+1]+(Q[j+1]-P[j+1])*ff;
    if(false){const dx=x-px,dy=y-py,d2=dx*dx+dy*dy;if(d2<1.1){const d=Math.sqrt(d2)+1e-4,f=(1.05-d)*.55;x+=dx/d*f;y+=dy/d*f}}
    Hb[j]=x;Hb[j+1]=y;Hb[j+2]=t<2.2?S0[j+2]+(W[0][j+2]-S0[j+2])*ii:P[j+2]+(Q[j+2]-P[j+2])*ff}return Hb}
  if(HVv===6){const G=an[0]&&an[0][0];const cx=G?G.x:(m?0:HV*asp*.22),cy=G?G.y:(m?1.4:0),sz=(G?G.r*2:(m?3.2:4.6))*(1+.015*Math.sin(t*1.2));const ii=ez(cl(t/2.2));const nf=FLAME.length/2;
   for(let i=0;i<N;i++){const j=i%nf;const tx=cx+FLAME[j*2]*sz,ty=cy+FLAME[j*2+1]*sz,tz=((i%7)-3)*.06;const k=i*3;Hb[k]=S0[k]+(tx-S0[k])*ii;Hb[k+1]=S0[k+1]+(ty-S0[k+1])*ii;Hb[k+2]=S0[k+2]+(tz-S0[k+2])*ii}return Hb}
  if(HVv===7){const cols=m?38:90,rows=Math.ceil(N/cols),Wv=HV*asp*1.5;for(let i=0;i<N;i++){const cxi=i%cols,r=Math.floor(i/cols);const x=(cxi/(cols-1)-.5)*Wv,z=-12+r/rows*15;const k=i*3;Hb[k]=x;Hb[k+1]=(m?-1.6:-2.1)+.45*Math.sin(x*.55+t*.7)+.35*Math.cos(z*.6+t*.5);Hb[k+2]=z}return Hb}
  return T[0]};
 useFrame((st)=>{const t=st.clock.elapsedTime;sp.current.x+=(pointer.x-sp.current.x)*.12;sp.current.y+=(pointer.y-sp.current.y)*.12;
  cur.p=prog.current;const p=Math.min(Math.max(cur.p,0),T.length-1.0001),i0=Math.floor(p),f=p-i0,e=f;
  const c7=Math.cos(t*.12),s7=Math.sin(t*.12);const GC=an[4]&&an[4][0];const gcx=GC?GC.x:0,ang=Math.atan2(-gcx,12)+Math.sin(t*.3)*.18,ca=Math.cos(ang),sa=Math.sin(ang);const A=i0===0&&HVv>=5?heroAt(t):T[i0],B=T[i0+1],pos=geo.attributes.position.array as Float32Array;
  const chaos=0,calm=(PV>=4&&m&&(p<.3||Math.abs(p-1)<.35||RG&&Math.abs(p-2)<.4||GL&&Math.abs(p-4)<.4))?0:(HVv===5&&p<.3?.012:.04)+chaos*.3,sm=Math.min(1,Math.max(0,p/.9)),sm2=sm*sm*(3-2*sm);
  const dark=document.documentElement.dataset.fin==='3'?0:Math.min(1,Math.max(0,(p-6.1)/.9));cur.dark+=(dark-cur.dark)*.2;
  const c=geo.attributes.aC.array as Float32Array;const w4=Math.max(0,1-Math.abs(p-4)*1.3);
  for(let i=0;i<N;i++){const k=i*3,w=ph[i*2],v=ph[i*2+1];
   let ax=A[k],az=A[k+2],bx=B[k],bz=B[k+2];if(i0===4){const dx=ax-gcx;ax=gcx+dx*ca+az*sa;az=-dx*sa+az*ca}if(i0+1===4){const dx=bx-gcx;bx=gcx+dx*ca+bz*sa;bz=-dx*sa+bz*ca}if(i0===7){ax=A[k]*c7+az*s7;az=-A[k]*s7+az*c7}if(i0+1===7){bx=B[k]*c7+bz*s7;bz=-B[k]*s7+bz*c7}
   pos[k]=ax+(bx-ax)*e+Math.sin(t*v+w)*calm;pos[k+1]=A[k+1]+(B[k+1]-A[k+1])*e+Math.cos(t*v*.8+w)*calm;pos[k+2]=az+(bz-az)*e+Math.sin(t*v*.6+w*2)*calm*.6;
   const red=i<NI||(i<(m?(PV>=4&&GL===2?600:340):820)&&w4>.5),dk=cur.dark;c[k]=red?(.77+dk*.23):(.09+dk*.82);c[k+1]=red?(.08+dk*.35):(.07+dk*.8);c[k+2]=red?(.1+dk*.28):(.06+dk*.78);if(HVv===5&&p<1&&red){const q=(1-p)*(1-heroRed.current);c[k]+=(.09-c[k])*q;c[k+1]+=(.07-c[k+1])*q;c[k+2]+=(.06-c[k+2])*q}
   if((HVv===6||HVv===5)&&p<1){const q=(1-p)*(HVv===5?heroRed.current:1);c[k]+=(.62-c[k])*q;c[k+1]+=(.03-c[k+1])*q;c[k+2]+=(.04-c[k+2])*q}}
  geo.attributes.position.needsUpdate=true;geo.attributes.aC.needsUpdate=true;
  const finD=document.documentElement.dataset.fin==='4'?Math.min(1,Math.max(0,p-6))*.6:0;mat.uniforms.uO.value=(HVv===5?1+.6*Math.max(0,1-p):1)*(1-finD)*(.55+.35*(1-cur.dark*.3))*(.3+.7*(HVv>=5?Math.max(sm2,1-Math.min(1,p)):sm2))*(m?(PV>=4?1:.8):1);mat.uniforms.uD.value=gl.getPixelRatio()*(HVv===5?1-(m?.3:.08)*Math.max(0,1-p):1)*(.7+.3*(HVv>=5?Math.max(sm2,1-Math.min(1,p)):sm2));
  if(grp.current){const g=grp.current;const globe=Math.max(0,1-Math.abs(p-4)*1.6);const pm=matchMedia('(pointer: coarse)').matches?0:1;const hz=HVv===5&&p<1?0:1;g.rotation.y+=((pointer.x*.05*pm*hz)-g.rotation.y)*.04;g.rotation.x+=((-pointer.y*.03*pm*hz)-g.rotation.x)*.04}});
 return <points ref={grp} geometry={geo} material={mat}/>}
export default function FilmGL({prog}:{prog:{current:number}}){
 return <Canvas dpr={[1,PV?3:2]} camera={{position:[0,0,12],fov:40}} gl={{antialias:true,alpha:true}} style={{position:'absolute',inset:0}}><Aspect prog={prog}/></Canvas>}
function Aspect({prog}:{prog:{current:number}}){const {size}=useThree();return <Dots key={size.width/size.height<.8?'m':'d'} prog={prog} asp={size.width/size.height}/>}
