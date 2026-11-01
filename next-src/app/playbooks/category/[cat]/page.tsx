import Page from '@/components/Page';import Reveal from '@/components/Reveal';import {pb,meta,ldJson} from '@/lib/pb';import {Card,Chips} from '@/components/PbCards';
export const dynamicParams=false;
export function generateStaticParams(){const c=pb().cats;return c.length?c.map(k=>({cat:k.slug})):[{cat:'none'}]}
export async function generateMetadata({params}:{params:Promise<{cat:string}>}){const {cat}=await params;return meta(`/playbooks/category/${cat}/`)}
export default async function C({params}:{params:Promise<{cat:string}>}){const {cat}=await params;const d=pb();const k=d.cats.find(x=>x.slug===cat);const ps=d.posts.filter(p=>p.cat===cat);return(<Page label="Playbooks" title={k?k.name:'Playbooks'} dots="book">
 <script type="application/ld+json" dangerouslySetInnerHTML={{__html:ldJson(`/playbooks/category/${cat}/`)}}/>
 {k&&<Reveal><p className="text-[19px] text-mu max-w-[52ch] -mt-6 mb-16">{k.desc}</p></Reveal>}
 <div className="grid gap-11"><Chips cur={cat} cats={d.cats}/><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-7 gap-y-9">{ps.map(p=><Reveal key={p.slug}><Card p={p}/></Reveal>)}</div></div></Page>)}
