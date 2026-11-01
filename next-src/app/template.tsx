'use client';
import {motion} from 'framer-motion';import {useEffect,useState} from 'react';
const E=[.76,0,.24,1] as const;
export default function T({children}:{children:React.ReactNode}){const [flip]=useState(()=>typeof window!=='undefined'&&!!(window as any).__hnav);useEffect(()=>{(window as any).__hnav=true},[]);
return <>{flip&&<motion.div aria-hidden className="fixed inset-0 z-[80] pointer-events-none bg-[#efe8dd] flex items-center justify-center" initial={{y:'0%'}} animate={{y:'-100%'}} transition={{duration:.95,ease:E,delay:.12}}>
 <span className="absolute left-0 right-0 bottom-0 h-[3px] bg-[#8A0305]"/>
 <motion.span className="wm text-[13px] text-[#16110f] flex items-center gap-3" initial={{opacity:1}} animate={{opacity:0}} transition={{duration:.35,delay:.1}}><img src="/haritt-3d.png?v=2" alt="" className="w-8 h-8"/>HARITT <b className="text-[#8A0305]">GROUP</b></motion.span></motion.div>}
 <motion.div initial={flip?{opacity:0,y:60,scale:.985}:{opacity:0}} animate={{opacity:1,y:0,scale:1}} transition={flip?{duration:1,ease:[.2,.7,.2,1],delay:.35}:{duration:.55,ease:[.2,.7,.2,1]}} style={{transformOrigin:'50% 0%'}}>{children}</motion.div></>}
