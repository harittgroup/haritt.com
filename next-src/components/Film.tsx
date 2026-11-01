'use client';
import dynamic from 'next/dynamic';import {useEffect,useRef,useState} from 'react';import Link from 'next/link';import Social from './Social';
const GL=dynamic(()=>import('./FilmGL'),{ssr:false});
const BG=['#F6F1EA','#F3E4D8','#F6F2EC','#F8EEE3','#EEE8DF','#F3E6DA','#F6F1EA','#16110f'];
const hex=(h:string)=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const mix=(a:string,b:string,t:number)=>{const x=hex(a),y=hex(b);return `rgb(${x.map((v,i)=>Math.round(v+(y[i]-v)*t)).join(',')})`};
const words=['Ventures.','Brands.','Solutions.'];
const N=8;
const finV=()=>{if(typeof window==='undefined')return 1;const v=Number(new URLSearchParams(location.search).get('fin'));return v>=1&&v<=4?v:4};
export default function Film(){
 const wrap=useRef<HTMLDivElement>(null),stage=useRef<HTMLDivElement>(null),probe=useRef<HTMLDivElement>(null),prog=useRef(0);const [on,setOn]=useState(0);const [w,setW]=useState(0);const [hv,setHv]=useState(5);
 useEffect(()=>{const v=Number(new URLSearchParams(location.search).get('hero'));if(v>=1&&v<=7)setHv(v)},[]);
 useEffect(()=>{const t=setTimeout(()=>dispatchEvent(new Event('film-relayout')),50);return()=>clearTimeout(t)},[hv]);
 useEffect(()=>{const t=setInterval(()=>setW(x=>(x+1)%3),2200);return()=>clearInterval(t)},[]);
 useEffect(()=>{
  const html=document.documentElement;const FIN=finV();html.dataset.fin=String(FIN);const BGs=[...BG];BGs[7]=FIN===3?'#F6F1EA':'#14100e';
  const sc=[...stage.current!.querySelectorAll<HTMLElement>('.sc')];
  const S=()=>probe.current!.offsetHeight||innerHeight;
  const top=()=>wrap.current!.offsetTop;const end=()=>top()+(N-1)*S();
  let last=-1;
  const render=(p:number)=>{if(Math.abs(p-last)<.0005)return;last=p;prog.current=p;const i0=Math.min(N-2,Math.floor(p));
   const bg=mix(BGs[i0],BGs[i0+1],p-i0);stage.current!.style.background=bg;wrap.current!.style.background=bg;
   html.dataset.dark=FIN!==3&&p>6.55?'1':'0';
   sc.forEach((el,i)=>{const d=p-i,a=Math.abs(d);const o=Math.min(1,Math.max(0,(.5-a)*6));
    el.style.opacity=String(o);el.style.transform=o>0?`translate(0,${(-d*40).toFixed(1)}px)`:'none';el.style.pointerEvents=o>.5?'auto':'none';el.classList.toggle('on',a<.3);el.style.visibility=o>0?'visible':'hidden'})};
  // scene paging: one gesture = one scene; visuals tween by time, never stop half-way
  const idxNow=()=>Math.min(N-1,Math.max(0,Math.round((scrollY-top())/S())));
  let cur=idxNow(),vis=cur,anim=0,busy=false;render(cur);
  const tween=(to:number)=>{cancelAnimationFrame(anim);const from=vis,t0=performance.now(),D=900;busy=true;
   const f=(t:number)=>{const k=Math.min(1,(t-t0)/D),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;vis=from+(to-from)*e;render(vis);if(k<1)anim=requestAnimationFrame(f);else{busy=false;const i=idxNow();if(i!==cur&&Math.abs(scrollY-(top()+i*S()))<4){cur=i;tween(i)}}};anim=requestAnimationFrame(f)};
  const go=(to:number)=>{to=Math.min(N-1,Math.max(0,to));if(to===cur&&!busy)return;cur=to;scrollTo({top:top()+to*S(),behavior:'instant' as ScrollBehavior});tween(to)};
  const inFilm=()=>scrollY<=end()+2&&!html.classList.contains('menu-open');
  // wheel / trackpad
  let lastW=0,lastD=0,lastFire=0;
  const onWheel=(e:WheelEvent)=>{const now=performance.now();const dy=e.deltaY;const gap=now-lastW;const ad=Math.abs(dy);
   const atEnd=cur===N-1&&scrollY>=end()-2;
   if(!inFilm()||(atEnd&&dy>0&&!busy&&now-lastFire>1200)){lastW=now;lastD=ad;return}
   e.preventDefault();
   const fresh=gap>250||ad>lastD*1.6+6;lastW=now;lastD=ad;
   if(ad<2||!fresh||busy||now-lastFire<450)return;lastFire=now;go(cur+(dy>0?1:-1))};
  // touch
  let y0=0,x0=0,moved=false;
  const onTS=(e:TouchEvent)=>{y0=e.touches[0].clientY;x0=e.touches[0].clientX;moved=false};
  const onTM=(e:TouchEvent)=>{const dy=y0-e.touches[0].clientY;const atEnd=cur===N-1&&scrollY>=end()-2;
   if(!inFilm()||(atEnd&&dy>0&&!moved&&!busy))return;if(e.cancelable)e.preventDefault();
   if(!moved&&Math.abs(dy)>40&&Math.abs(dy)>Math.abs(x0-e.touches[0].clientX)&&!busy){moved=true;go(cur+(dy>0?1:-1))}};
  // keys
  const onK=(e:KeyboardEvent)=>{if(!inFilm())return;const k=e.key;let d=0;if(k==='ArrowDown'||k==='PageDown'||(k===' '&&!e.shiftKey))d=1;else if(k==='ArrowUp'||k==='PageUp'||(k===' '&&e.shiftKey))d=-1;if(!d)return;if(d>0&&cur===N-1)return;e.preventDefault();if(!busy)go(cur+d)};
  // native scroll (footer coming back up, scrollbar drag, resize): settle to nearest scene
  let raf=0;const onS=()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;if(busy)return;const i=idxNow();if(i!==cur){cur=i;tween(i)}})};
  const onR=()=>{last=-1;render(vis)};
  addEventListener('wheel',onWheel,{passive:false});addEventListener('touchstart',onTS,{passive:true});addEventListener('touchmove',onTM,{passive:false});addEventListener('keydown',onK);addEventListener('scroll',onS,{passive:true});addEventListener('resize',onR);
  return()=>{cancelAnimationFrame(anim);removeEventListener('wheel',onWheel);removeEventListener('touchstart',onTS);removeEventListener('touchmove',onTM);removeEventListener('keydown',onK);removeEventListener('scroll',onS);removeEventListener('resize',onR);html.dataset.dark='0'}},[]);
 const hl=(k:number)=>({opacity:w===k?1:.2,transition:'opacity .8s'});
 return(<div ref={wrap} className="relative" style={{height:`calc(${N-1} * 100svh + 100lvh)`,background:BG[0]}}>
  <div ref={probe} aria-hidden className="absolute left-0 top-0 w-px h-[100svh] pointer-events-none opacity-0"/>
  <div ref={stage} data-stage className="sticky top-0 h-[100svh] overflow-hidden" style={{background:BG[0]}}>
  <div className="absolute inset-0 pointer-events-none" aria-hidden><i className="glow g1"/><i className="glow g2"/><i className="glow g3"/></div>
  <GL prog={prog}/>
  <div className="absolute inset-0 pointer-events-none">
   <Scene wide={hv===4||hv===6}>{hv===5?<><p className="ri mt-[32vh] md:mt-[40vh] text-[16px] md:text-[19px] tracking-[.01em] text-ink/60 max-w-[30ch] md:max-w-none mx-auto" style={{['--d' as any]:2000}}>that deliver meaningful value to people and the world.</p><div className="ri absolute left-1/2 -translate-x-1/2 bottom-8" style={{['--d' as any]:2600}}><i className="block w-px h-12 bg-ink/15 overflow-hidden relative"><b className="scl absolute left-0 top-0 w-px h-5 bg-ink/60"/></i></div></>:hv===7?<div className="-mt-[22vh]"><h1 className="disp leading-[1.02] text-[clamp(48px,8vw,128px)]">{words.map((x,k)=><span key={x} className="ri block" style={{['--d' as any]:150+k*130,...hl(k)}}>{x}</span>)}</h1><p className="ri mt-6 text-lg md:text-xl text-ink/60" style={{['--d' as any]:700}}>that deliver meaningful value to people and the world.</p></div>:hv===1?<><h1 className="disp leading-[1.02] text-[clamp(52px,9.4vw,148px)]">{words.map((x,k)=><span key={x} className="ri block" style={{['--d' as any]:150+k*130,...hl(k)}}>{x}</span>)}</h1><p className="ri mt-8 text-lg md:text-xl text-ink/60" style={{['--d' as any]:700}}>that deliver meaningful value to people and the world.</p></>
    :hv===2?<><h1 className="disp font-medium leading-[1.08] text-[clamp(34px,5.4vw,84px)] max-w-[20ch] mx-auto"><span className="ri block" style={{['--d' as any]:100}}>Creating ventures, brands</span><span className="ri block" style={{['--d' as any]:220}}>and solutions <span className="text-ink/40">that deliver</span></span><span className="ri block text-ink/40" style={{['--d' as any]:340}}>meaningful value to people</span><span className="ri block text-ink/40" style={{['--d' as any]:460}}>and the world.</span></h1></>
    :hv===3?<><p className="ri lab justify-center !mb-8" style={{['--d' as any]:0}}>Haritt Group</p><h1 className="disp font-medium leading-[1] text-[clamp(44px,8vw,128px)]"><span className="ri inline-block" style={{['--d' as any]:150}}>Creating</span>{' '}<span className="ri inline-grid overflow-hidden align-bottom h-[1.08em]" style={{['--d' as any]:250}}>{words.map((x,k)=><span key={x} className="text-red [grid-area:1/1] transition-all duration-700 ease-[cubic-bezier(.2,.7,.2,1)]" style={{opacity:w===k?1:0,transform:`translateY(${w===k?0:(k-w+3)%3===1?100:-100}%)`}}>{x.replace('.','').toLowerCase()}</span>)}</span></h1><p className="ri mt-8 text-lg md:text-2xl text-ink/60 max-w-[30ch] mx-auto" style={{['--d' as any]:600}}>that deliver meaningful value to people and the world.</p></>
    :hv===4||hv===6?<div className="flex flex-col md:flex-row items-center md:justify-between gap-8 md:px-6 text-center md:text-left"><div><p className="ri lab !mb-6 justify-center md:justify-start" style={{['--d' as any]:0}}>Haritt Group</p><h1 className="disp font-medium leading-[1.04] text-[clamp(40px,6vw,96px)]"><span className="ri block" style={{['--d' as any]:120}}>Ventures.</span><span className="ri block" style={{['--d' as any]:240}}>Brands.</span><span className="ri block" style={{['--d' as any]:360}}>Solutions.</span></h1><p className="ri mt-6 text-lg md:text-xl text-ink/60 max-w-[28ch] mx-auto md:mx-0" style={{['--d' as any]:520}}>that deliver meaningful value to people and the world.</p></div><i data-a aria-hidden className="block shrink-0 w-[56vw] h-[56vw] md:w-[min(56vh,36vw)] md:h-[min(56vh,36vw)] order-first md:order-none"/></div>:null}</Scene>
   <Scene wide><div className="flex flex-col md:flex-row items-center md:justify-between gap-6 md:gap-[4vw] md:px-6"><div className="md:text-left order-2 md:order-1"><p className="ri disp font-bold text-[clamp(34px,5.4vw,84px)] leading-[1.06] max-w-[12ch] mx-auto md:mx-0" style={{['--d' as any]:0}}>AI can do almost anything.</p><p className="ri disp font-medium text-[clamp(18px,2.2vw,32px)] text-ink/50 mt-6" style={{['--d' as any]:250}}>Most of it is still built for experts.</p></div><i data-a aria-hidden className="block shrink-0 order-1 md:order-2 w-[70vw] h-[40vw] md:w-[min(76vh,42vw)] md:h-[min(46vh,26vw)]"/></div></Scene>
   <Scene><p className="ri disp font-bold text-[clamp(40px,7vw,108px)] leading-[1.04]" style={{['--d' as any]:0}}>We make it simple.</p><p className="ri mt-8 text-lg md:text-xl text-ink/60 max-w-[34ch] mx-auto" style={{['--d' as any]:250}}>Haritt Group works on problems that people and businesses face everywhere, and solves them with simple, useful technology.</p></Scene>
   <Scene wide><div className="flex flex-col md:grid md:grid-cols-3 md:gap-8 text-left md:text-center">{[['Ventures','Businesses built around one real problem.'],['Brands','Names and identities people trust.'],['Solutions','Simple, AI-powered answers to everyday problems.']].map(([a,b],k)=><div key={a} className="relative h-[24vh] md:h-auto flex flex-col justify-center pl-[36vw] md:pl-0"><i data-a aria-hidden className="block absolute left-0 top-1/2 -translate-y-1/2 md:static md:translate-y-0 md:mx-auto md:mb-6 w-[26vw] h-[26vw] md:w-[24vh] md:h-[24vh]"/><h2 className="ri disp font-bold text-[clamp(26px,3.6vw,52px)]" style={{['--d' as any]:k*140}}>{a}</h2><p className="ri text-ink/60 mt-2 text-[14px] leading-snug md:text-lg md:max-w-[22ch] md:mx-auto" style={{['--d' as any]:k*140+120}}>{b}</p></div>)}</div></Scene>
   <Scene wide><div className="flex flex-col md:flex-row-reverse items-center md:justify-between gap-8 md:gap-[4vw] md:px-6"><i data-a aria-hidden className="block shrink-0 w-[62vw] h-[62vw] md:w-[min(62vh,40vw)] md:h-[min(62vh,40vw)]"/><div className="md:text-left"><p className="ri disp font-bold text-[clamp(44px,7vw,112px)] leading-[1.02] md:whitespace-nowrap" style={{['--d' as any]:0}}>India first.<br/><span className="text-ink/35">World next.</span></p><p className="ri mt-6 text-lg text-ink/60 max-w-[30ch] mx-auto md:mx-0" style={{['--d' as any]:250}}>Today, apps and digital services. Next, anywhere there is value to create.</p></div></div></Scene>
   <Scene wide><div className="flex flex-col md:grid md:grid-cols-2 md:gap-10 text-left md:text-center">{[['Mission','To solve real problems for people and businesses everywhere, with technology that is simple, useful and within everyone’s reach.'],['Vision','A world where every person and every business, anywhere, can use the best of technology to live and work better.']].map(([a,b],k)=><div key={a} className="relative h-[35vh] md:h-auto flex flex-col justify-center pl-[33vw] md:pl-0 md:px-6"><i data-a aria-hidden className="block absolute left-0 top-1/2 -translate-y-1/2 md:static md:translate-y-0 md:mx-auto md:mb-6 w-[24vw] h-[24vw] md:w-[22vh] md:h-[22vh]"/><h3 className="ri lab md:justify-center !mb-3" style={{['--d' as any]:k*160}}>{a}</h3><p className="ri disp font-bold text-[17px] md:text-[clamp(22px,2.4vw,36px)] leading-[1.25] max-w-[26ch] md:mx-auto" style={{['--d' as any]:k*160+100}}>{b}</p></div>)}</div></Scene>
   <Scene wide><div className="flex flex-col md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-[6vh] text-left md:text-center">{['Useful before impressive','Simple by design','Private by default','Honest and accessible'].map((a,k)=><div key={a} className="relative h-[19vh] md:h-auto flex flex-col justify-center pl-[28vw] md:pl-0"><i data-a aria-hidden className="block absolute left-0 top-1/2 -translate-y-1/2 md:static md:translate-y-0 md:mx-auto md:mb-6 w-[18vw] h-[18vw] md:w-[15vh] md:h-[15vh] md:!mb-4"/><p className="ri disp font-bold text-[20px] md:text-[clamp(22px,2.6vw,40px)] leading-[1.15]" style={{['--d' as any]:k*130}}>{a}</p></div>)}</div></Scene>
   <Scene><p className="ri fin-t disp font-bold text-[clamp(38px,6.4vw,100px)] leading-[1.04] text-white max-w-[14ch] mx-auto" style={{['--d' as any]:0}}>Every venture stands on its own.</p><Link href="/ventures/" className="ri fin-b inline-flex items-center gap-3 mt-10 px-9 py-5 rounded-full bg-white text-ink disp font-bold text-[13px] tracking-[.2em] uppercase hover:gap-6 transition-all" style={{['--d' as any]:300}}>See our ventures <span>→</span></Link><p className="ri fin-s mt-8 text-[12px] tracking-[.3em] uppercase text-white/75" style={{['--d' as any]:450}}>Started 2020 · Relaunched 2026</p>
    <div className="fin-f absolute left-0 right-0 bottom-0 px-6 md:px-9 pb-[max(20px,env(safe-area-inset-bottom))] text-[12px] text-white/45"><div className="mx-auto max-w-[1240px] flex flex-col md:flex-row gap-2 md:justify-between items-center border-t border-current/20 pt-5"><span>© 2026 Haritt Group · Built in India</span><Social className="text-white/70 !gap-4 order-first md:order-none" size={16}/><span className="flex gap-6"><Link href="/about/">About</Link><Link href="/contact/">Contact</Link><Link href="/privacy/">Privacy</Link></span></div></div></Scene>
  </div></div></div>)}
function Scene({children,wide}:{children:React.ReactNode;wide?:boolean}){return <div className="sc absolute inset-0 flex items-center justify-center text-center px-6" style={{opacity:0,visibility:'hidden'}}><div className={wide?'w-full max-w-[1240px]':'max-w-[1100px]'}>{children}</div></div>}
