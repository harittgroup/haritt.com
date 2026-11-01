'use client';
import {useEffect,useState} from 'react';import Link from 'next/link';import {usePathname} from 'next/navigation';
const L=[['About','/about/'],['Ventures','/ventures/'],['Playbooks','/playbooks/'],['Contact','/contact/']];
export default function Nav(){const [s,setS]=useState(false);const [o,setO]=useState(false);const [hid,setHid]=useState(false);const p=usePathname();const home=p==='/';
useEffect(()=>{const f=()=>setS(!home&&scrollY>20);f();addEventListener('scroll',f,{passive:true});return()=>removeEventListener('scroll',f)},[home]);
useEffect(()=>{setO(false)},[p]);
useEffect(()=>{let ly=scrollY;const f=()=>{const y=scrollY;if(Math.abs(y-ly)<6)return;setHid(y>ly&&y>80);ly=y};addEventListener('scroll',f,{passive:true});return()=>removeEventListener('scroll',f)},[]);
useEffect(()=>{document.documentElement.classList.toggle('menu-open',o)},[o]);
return(<><nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${hid&&!o?'-translate-y-full':'translate-y-0'} ${s&&!o?'bg-paper/95 md:bg-paper/90 md:backdrop-blur-xl border-b border-black/10':''}`}><div className="mx-auto max-w-[1240px] px-6 md:px-9 h-[72px] md:h-[82px] flex items-center justify-between">
<Link href="/" className="navt flex items-center gap-3 wm text-[13px] text-ink relative z-[60]"><img src="/haritt-3d.png?v=2" className="w-9 h-9" alt=""/><span>HARITT <b className="text-red">GROUP</b></span></Link>
<ul className="navt hidden md:flex gap-10 text-[15px] text-mu">{L.map(([a,h])=>{const on=p.startsWith(h);return <li key={a}><Link href={h} aria-current={on?'page':undefined} className={`relative inline-block py-2 transition hover:opacity-60 ${on?'text-ink':''}`}>{a}<span className={`absolute left-0 right-0 bottom-0 h-[2px] rounded-full bg-red origin-left transition-transform duration-500 ${on?'scale-x-100':'scale-x-0'}`}/></Link></li>})}</ul>
<button aria-label={o?'Close menu':'Open menu'} aria-expanded={o} onClick={()=>setO(!o)} className="navt md:hidden relative z-[60] w-11 h-11 -mr-2 grid place-items-center text-ink"><span className="relative block w-6 h-[10px]"><i className={`absolute left-0 w-6 h-[1.6px] bg-current transition-all duration-300 ${o?'top-[4px] rotate-45':'top-0'}`}/><i className={`absolute left-0 w-6 h-[1.6px] bg-current transition-all duration-300 ${o?'top-[4px] -rotate-45':'top-[8px]'}`}/></span></button></div></nav>
<div className={`md:hidden fixed inset-0 z-[45] bg-[#f6f1ea] transition-[opacity,visibility] duration-500 ${o?'opacity-100 visible':'opacity-0 invisible'}`}>
 <div className="h-full flex flex-col justify-between px-6 pt-28 pb-[max(28px,env(safe-area-inset-bottom))]">
  <ul className="flex flex-col gap-2">{L.map(([a,h],i)=><li key={a} className="overflow-hidden"><Link href={h} onClick={()=>setO(false)} className={`block disp font-bold text-[44px] leading-[1.15] transition-all duration-700 ${p.startsWith(h)?'text-red':'text-ink'} ${o?'translate-y-0 opacity-100':'translate-y-full opacity-0'}`} style={{transitionDelay:o?`${120+i*70}ms`:'0ms'}}>{a}</Link></li>)}</ul>
  <div className={`text-[13px] text-ink/50 transition-opacity duration-700 ${o?'opacity-100':'opacity-0'}`} style={{transitionDelay:o?'450ms':'0ms'}}><a href="mailto:contact@haritt.com" className="block text-ink text-[17px] mb-2">contact@haritt.com</a>© 2026 Haritt Group · Built in India</div>
 </div></div></>)}
