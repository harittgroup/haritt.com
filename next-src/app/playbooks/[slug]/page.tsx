import Link from 'next/link';import Reveal from '@/components/Reveal';import PostFx from '@/components/PostFx';import {pb,meta,ldJson} from '@/lib/pb';import {Card} from '@/components/PbCards';import '../pb.css';
export const dynamicParams=false;
export function generateStaticParams(){const p=pb().posts;return p.length?p.map(x=>({slug:x.slug})):[{slug:'none'}]}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return meta(`/playbooks/${slug}/`)}
function Share({url,title,cls=''}:{url:string;title:string;cls?:string}){const e=encodeURIComponent;const a='rounded-full border border-ink/15 px-3 py-1 text-[13.5px] hover:border-red hover:text-red transition';return <div className={`flex flex-wrap items-center gap-2 text-mu text-[14px] ${cls}`}><span>Share</span><a className={a} target="_blank" rel="noopener" href={`https://www.linkedin.com/sharing/share-offsite/?url=${e(url)}`}>LinkedIn</a><a className={a} target="_blank" rel="noopener" href={`https://x.com/intent/post?url=${e(url)}&text=${e(title)}`}>X</a><a className={a} target="_blank" rel="noopener" href={`https://wa.me/?text=${e(title+' '+url)}`}>WhatsApp</a><button type="button" className={a} data-copy={url}>Copy link</button></div>}
export default async function Post({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const d=pb();const p=d.posts.find(x=>x.slug===slug);if(!p)return null;const url='https://haritt.com'+p.url;const pubName=d.publisher.name||'Haritt Group';
 const rel=(d.posts.filter(q=>q.slug!==p.slug&&q.cat===p.cat).slice(0,2));const rel2=rel.length?rel:d.posts.filter(q=>q.slug!==p.slug).slice(0,2);
 return(<main className="pbx pt-28 md:pt-36 pb-28"><PostFx/><div className="pbbar" id="pbbar"/>
 <script type="application/ld+json" dangerouslySetInnerHTML={{__html:ldJson(p.url)}}/>
 <article><header className="mx-auto max-w-[1240px] px-6 md:px-9"><div className="max-w-[880px] mx-auto">
  <div className="flex items-center gap-3"><nav aria-label="Breadcrumb" className="text-[14px] text-mu"><Link href="/playbooks/" className="text-red hover:underline">Playbooks</Link>{p.catName&&<> / <Link href={`/playbooks/category/${p.cat}/`} className="text-red hover:underline">{p.catName}</Link></>}</nav></div>
  <Reveal><h1 className="disp text-[clamp(34px,5.4vw,68px)] leading-[1.06] mt-5">{p.title}</h1><p className="text-[19px] md:text-[21px] text-ink/70 mt-6 max-w-[700px]">{p.excerpt}</p>
  <div className="flex items-center gap-3.5 mt-8 text-[14px] text-mu leading-snug"><img src="/haritt-3d.png?v=2" alt="" className="w-11 h-11"/><span><b className="text-ink font-semibold text-[15px]">{pubName}</b><br/>{p.date} · Updated {p.updated} · {p.minutes} min read</span></div></Reveal></div>
  {p.cover&&<Reveal className="mt-10"><img src={p.cover.src} alt={p.cover.alt} width={p.cover.w||undefined} height={p.cover.h||undefined} className="w-full h-auto max-h-[640px] object-cover rounded-[22px]"/></Reveal>}
 </header>
 <div className="mx-auto max-w-[1240px] px-6 md:px-9 pbw"><div className="pbside">{p.toc.length>=3&&<nav className="pbtoc" aria-label="On this page"><div className="text-[12px] tracking-[.24em] uppercase text-red mb-2 disp">In this playbook</div>{p.toc.map(([i,t])=><a key={i} href={`#${i}`}>{t}</a>)}</nav>}<Share url={url} title={p.title} cls="pbsh"/></div>
  <div className="min-w-0"><div dangerouslySetInnerHTML={{__html:p.html+p.end}} className="pbbody"/>
   <div className="pbau"><img src="/haritt-3d.png?v=2" alt="" className="w-11 h-11 shrink-0"/><div><b>{pubName}</b><p>{d.publisher.bio}</p></div></div><Share url={url} title={p.title} cls="pbsh2 mt-8"/></div></div></article>
 {rel2.length>0&&<section className="mx-auto max-w-[1240px] px-6 md:px-9 pt-16 border-t border-ink/10"><p className="lab">Keep reading</p><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-7 gap-y-9">{rel2.map(q=><Card key={q.slug} p={q}/>)}</div></section>}
 </main>)}
