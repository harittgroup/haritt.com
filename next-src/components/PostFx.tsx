'use client';
import {useEffect} from 'react';
export default function PostFx(){useEffect(()=>{const b=document.getElementById('pbbar');const f=()=>{const a=document.querySelector('.pbbody');if(!a||!b)return;const r=a.getBoundingClientRect(),t=r.height-innerHeight*.5;b.style.width=Math.max(0,Math.min(100,(-r.top+innerHeight*.3)/t*100))+'%'};addEventListener('scroll',f,{passive:true});f();
 const c=(e:MouseEvent)=>{const t=(e.target as HTMLElement).closest('[data-copy]') as HTMLElement|null;if(!t)return;navigator.clipboard?.writeText(t.dataset.copy||'');const o=t.textContent;t.textContent='Copied';setTimeout(()=>{t.textContent=o},1500)};document.addEventListener('click',c);
 return()=>{removeEventListener('scroll',f);document.removeEventListener('click',c)}},[]);return null}
