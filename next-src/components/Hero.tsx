'use client';
import dynamic from 'next/dynamic';import {useEffect,useState} from 'react';import {motion} from 'framer-motion';
const GL=dynamic(()=>import('./HeroGL'),{ssr:false});
const words=['Ventures.','Brands.','Solutions.'];
export default function Hero(){const [i,setI]=useState(0);useEffect(()=>{const t=setInterval(()=>setI(x=>(x+1)%3),2200);return()=>clearInterval(t)},[]);
return(<header className="relative min-h-screen flex items-center justify-center text-ink overflow-hidden"><GL/>
<div className="relative z-10 px-6 text-center">
<motion.img src="/haritt-3d.png?v=2" alt="" initial={{opacity:0,scale:.85}} animate={{opacity:1,scale:1}} transition={{duration:1.2,ease:[.2,.7,.2,1]}} className="w-24 h-24 mx-auto mb-10 drop-shadow-xl"/>
<h1 className="disp font-bold leading-[1.05] text-[clamp(44px,8.4vw,128px)]">{words.map((w,k)=><motion.span key={w} className="block" initial={{opacity:0,y:50}} animate={{opacity:i===k?1:.22,y:0}} transition={{opacity:{duration:.7},y:{duration:1,delay:.2+k*.12,ease:[.2,.7,.2,1]}}}>{w}</motion.span>)}</h1>
<motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1,duration:1.2}} className="mt-10 text-lg md:text-xl text-ink/65">that deliver meaningful value to people and the world.</motion.p></div>
<div className="absolute bottom-8 inset-x-0 z-10 text-center text-[12px] tracking-[.3em] uppercase text-ink/45">Scroll</div></header>)}
