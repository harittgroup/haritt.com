'use client';
import {useEffect} from 'react';import {usePathname} from 'next/navigation';import Lenis from 'lenis';import gsap from 'gsap';import {ScrollTrigger} from 'gsap/ScrollTrigger';
export default function Smooth({children}:{children:React.ReactNode}){const path=usePathname();
useEffect(()=>{if(path==='/'||matchMedia('(pointer: coarse)').matches)return;gsap.registerPlugin(ScrollTrigger);const l=new Lenis({lerp:.09});(window as any).__lenis=l;l.on('scroll',ScrollTrigger.update);
const t=(time:number)=>l.raf(time*1000);gsap.ticker.add(t);gsap.ticker.lagSmoothing(0);return()=>{gsap.ticker.remove(t);l.destroy();(window as any).__lenis=null}},[path]);
return <>{children}</>}
