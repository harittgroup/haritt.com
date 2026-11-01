import {FLAME} from './flame';
export const isPhone=()=>typeof window!=='undefined'&&(innerWidth<768||innerWidth/innerHeight<.8);
// even hex grid of points inside a mask, about M points
export function hexGrid(A:(x:number,y:number)=>boolean,cw:number,ch:number,M:number){const gr=(st:number)=>{const o:number[]=[];let row=0;for(let yy=st/2;yy<ch;yy+=st*.866,row++)for(let xx=(row%2)*st/2;xx<cw;xx+=st){const X=Math.round(xx),Y=Math.round(yy);if(A(X,Y))o.push(X,Y)}return o};
 let lo=1,hi=Math.max(cw,ch)/4,best:number[]=gr(hi);for(let it=0;it<18;it++){const mid=(lo+hi)/2,o=gr(mid);if(o.length/2>M)lo=mid;else{hi=mid;best=o}}return best}
// flame points in FLAME space (y up, ~[-.5,.5]) on an even grid
export function flameGrid(M:number){const S=600,c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d')!;x.fillStyle='#000';const n=FLAME.length/2;for(let i=0;i<n;i++){x.beginPath();x.arc(S/2+FLAME[i*2]*S,S/2-FLAME[i*2+1]*S,S*.016,0,6.283);x.fill()}
 const d=x.getImageData(0,0,S,S).data;const p=hexGrid((X,Y)=>X>=0&&Y>=0&&X<S&&Y<S&&d[(Y*S+X)*4+3]>128,S,S,M);const o:number[]=[];for(let i=0;i<p.length;i+=2)o.push((p[i]-S/2)/S,-(p[i+1]-S/2)/S);return o}
// evenly spaced points along the outline of a mask (about M points)
export function edgeEven(A:(x:number,y:number)=>boolean,cw:number,ch:number,M:number,rnd:()=>number=Math.random){const E:number[]=[];for(let y=0;y<ch;y+=2)for(let x=0;x<cw;x+=2)if(A(x,y)&&(!A(x+4,y)||!A(x-4,y)||!A(x,y+4)||!A(x,y-4)))E.push(x,y);const ne=E.length/2;const ord=Array.from({length:ne},(_,q)=>q);for(let q=ne-1;q>0;q--){const r=Math.floor(rnd()*(q+1));[ord[q],ord[r]]=[ord[r],ord[q]]}
 const pd=(rr:number)=>{const g=new Map<number,number[]>();const out:number[]=[];for(const q of ord){const X=E[q*2],Y=E[q*2+1],gx=Math.floor(X/rr),gy=Math.floor(Y/rr);let ok=true;for(let a=-1;a<=1&&ok;a++)for(let b=-1;b<=1&&ok;b++){const L=g.get((gx+a)*99991+gy+b);if(L)for(let u=0;u<L.length;u+=2){const dx=L[u]-X,dy=L[u+1]-Y;if(dx*dx+dy*dy<rr*rr){ok=false;break}}}if(ok){out.push(X,Y);const k=gx*99991+gy;(g.get(k)||g.set(k,[]).get(k)!).push(X,Y)}}return out};
 let lo=1,hi=60,best:number[]=[];for(let it=0;it<14;it++){const mid=(lo+hi)/2,o=pd(mid);if(o.length/2>M)lo=mid;else{hi=mid;best=o}}return best}
