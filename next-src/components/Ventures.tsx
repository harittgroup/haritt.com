'use client';
import VentureDots from './VentureDots';import {useEffect,useState} from 'react';import {motion} from 'framer-motion';
const ease=[.2,.7,.2,1] as const;
const R=({children,d=0,className=''}:{children:React.ReactNode;d?:number;className?:string})=><motion.div className={className} initial={{opacity:0,y:28,filter:'blur(8px)'}} whileInView={{opacity:1,y:0,filter:'blur(0px)'}} viewport={{once:true,amount:.4}} transition={{duration:1,ease,delay:d}}>{children}</motion.div>;
const V=[
 {name:'Haritt Developers',kind:'Digital services',line:'One partner for your website, brand, marketing and AI, instead of five vendors.',who:'For businesses that want to grow online',url:'https://developers.haritt.com/',bg:'#0f0b09',acc:'#F2551A',dots:{kind:'flame' as const},logo:'/developers-3d.png?v=2',
  pts:[['Websites & apps','Fast, clean and built to bring enquiries.'],['Branding','Look established from day one.'],['Marketing & leads','Campaigns that bring real customers.'],['AI solutions','Automate the hours of manual work.']],facts:['Roots in 2020','Relaunched 2026','Based in India']},
 {name:'HV Verse',kind:'Digital product ecosystem',line:'Everyday apps that help people plan their day, know themselves and grow their career.',who:'For students and young professionals',url:'https://thehvverse.com/',bg:'#0d0e22',acc:'#7b83ff',dots:{kind:'hv' as const},logo:'/hv-verse.svg',
  pts:[['HV Reset','Plan your day and stay focused.'],['HV Assess','Understand your strengths.'],['HV Hunt','Manage your job search.'],['HV AI','Your everyday AI helper.']],facts:['Started 2026','4 apps','Web first']}];
export default function Ventures(){const [vl,setVl]=useState(3);useEffect(()=>{setVl(Number(new URLSearchParams(location.search).get("vl"))||3)},[]);
 useEffect(()=>{const h=document.documentElement;const f=()=>{const el=document.elementsFromPoint(innerWidth/2,41).find(e=>(e as HTMLElement).dataset?.dk);h.dataset.dark=el?'1':'0'};f();addEventListener('scroll',f,{passive:true});return()=>{removeEventListener('scroll',f);h.dataset.dark='0'}},[]);
 return(<main>
 <section className="min-h-[88svh] flex flex-col justify-center mx-auto max-w-[1240px] px-6 md:px-9 pt-32 pb-16">
  <R><p className="lab">Ventures</p></R>
  <R d={.1}><h1 className="disp font-bold text-[clamp(44px,8vw,128px)] leading-[1.02] max-w-[14ch]">Each venture stands on its own.</h1></R>
  <R d={.25}><p className="mt-8 text-lg md:text-xl text-ink/60 max-w-[44ch]">Its own name, its own team, its own audience. Two today, more on the way.</p></R>
  <R d={.4} className="mt-16 hidden md:flex gap-3 text-[13px] tracking-[.2em] uppercase text-ink/50"><span>01 Haritt Developers</span><span>·</span><span>02 HV Verse</span></R>
 </section>
 {V.map((v,i)=><section key={v.name} data-dk="1" className="relative min-h-[100svh] flex items-center overflow-hidden" style={{background:v.bg,color:'#f4f1ee'}}>
  <div aria-hidden className="absolute -right-[20vw] -bottom-[30vw] w-[70vw] h-[70vw] rounded-full blur-[120px] opacity-30" style={{background:v.acc}}/>
  <div className={'relative mx-auto w-full max-w-[1240px] px-6 md:px-9 md:py-24 grid md:grid-cols-2 md:gap-16 items-center '+(vl===3?'py-16 gap-4':'py-24 gap-10')}>
   <div className={(i%2?'md:order-2':'md:order-none')+(vl===2?' order-2':'')}><VentureDots kind={v.dots.kind} text={(v.dots as any).text} color={v.acc} className={'w-full md:h-[62vh] '+(vl===2?'h-[34vh]':vl===3?'h-[28vh]':'h-[42vh]')}/></div>
   <div>
    <R className="flex items-center gap-4"><img src={(v as any).logo} alt="" className="w-11 h-11 md:w-12 md:h-12 rounded-full"/><p className="text-[12px] tracking-[.3em] uppercase" style={{color:v.acc}}>0{i+1} · {v.kind}</p></R>
    <R d={.1}><h2 className="disp font-bold text-[clamp(40px,5.6vw,88px)] leading-[1.02] mt-5">{v.name}</h2></R>
    <R d={.2}><p className="mt-6 text-lg md:text-xl text-white/80 max-w-[38ch] leading-snug">{v.line}</p><p className="mt-3 text-[14px] text-white/45">{v.who}</p></R>
    <R d={.3} className="mt-9 grid grid-cols-2 gap-x-6 gap-y-6 max-w-[520px]">{v.pts.map(([t,d])=><div key={t} className="border-t border-white/12 pt-4"><p className="disp font-semibold text-[16px] md:text-[18px]" style={{color:v.acc}}>{t}</p><p className="text-[13px] md:text-[14px] text-white/55 mt-1 leading-snug">{d}</p></div>)}</R>
    <R d={.35} className="mt-8 flex flex-wrap gap-x-5 gap-y-1 text-[12px] tracking-[.18em] uppercase text-white/40">{v.facts.map(f=><span key={f}>{f}</span>)}</R>
    <R d={.4}><a href={v.url} className="group inline-flex items-center gap-3 mt-10 px-8 py-4 rounded-full disp font-bold text-[13px] tracking-[.2em] uppercase transition-all hover:gap-6" style={{background:v.acc,color:'#fff'}}>Visit {v.name} <span>→</span></a></R>
   </div></div></section>)}
 <section className="py-28 text-center mx-auto max-w-[1240px] px-6"><R><p className="disp font-bold text-[clamp(28px,4vw,56px)] leading-tight">The next venture is in the works.</p></R><R d={.15}><a href="/contact/" className="inline-block mt-8 text-ink/60 border-b border-ink/30 pb-1">Talk to us →</a></R></section>
</main>)}
