import {FLAME} from './flame';
export const isPhone=()=>typeof window!=='undefined'&&(innerWidth<768||innerWidth/innerHeight<.8);
// even hex grid of points inside a mask, about M points
export function hexGrid(A:(x:number,y:number)=>boolean,cw:number,ch:number,M:number){const gr=(st:number)=>{const o:number[]=[];let row=0;for(let yy=st/2;yy<ch;yy+=st*.866,row++)for(let xx=(row%2)*st/2;xx<cw;xx+=st){const X=Math.round(xx),Y=Math.round(yy);if(A(X,Y))o.push(X,Y)}return o};
 let lo=1,hi=Math.max(cw,ch)/4,best:number[]=gr(hi);for(let it=0;it<18;it++){const mid=(lo+hi)/2,o=gr(mid);if(o.length/2>M)lo=mid;else{hi=mid;best=o}}return best}
// flame points in FLAME space (y up, ~[-.5,.5]) on an even grid
export function flameGrid(M:number){const S=600,c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d')!;x.fillStyle='#000';const n=FLAME.length/2;for(let i=0;i<n;i++){x.beginPath();x.arc(S/2+FLAME[i*2]*S,S/2-FLAME[i*2+1]*S,S*.016,0,6.283);x.fill()}
 const d=x.getImageData(0,0,S,S).data;const p=hexGrid((X,Y)=>X>=0&&Y>=0&&X<S&&Y<S&&d[(Y*S+X)*4+3]>128,S,S,M);const o:number[]=[];for(let i=0;i<p.length;i+=2)o.push((p[i]-S/2)/S,-(p[i+1]-S/2)/S);return o}
