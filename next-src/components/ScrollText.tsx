'use client';
import {useEffect,useRef} from 'react';import gsap from 'gsap';import {ScrollTrigger} from 'gsap/ScrollTrigger';
export default function ScrollText({text,className=''}:{text:string;className?:string}){
const r=useRef<HTMLParagraphElement>(null);
useEffect(()=>{gsap.registerPlugin(ScrollTrigger);const w=r.current!.querySelectorAll('span');
const t=gsap.fromTo(w,{color:'rgba(22,17,15,.14)'},{color:'#16110f',stagger:.1,ease:'none',scrollTrigger:{trigger:r.current,start:'top 80%',end:'bottom 45%',scrub:true}});return()=>{t.scrollTrigger?.kill();t.kill()}},[]);
return <p ref={r} className={className}>{text.split(' ').map((w,i)=><span key={i}>{w} </span>)}</p>}
