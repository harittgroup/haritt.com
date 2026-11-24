import Page from '@/components/Page';import Reveal from '@/components/Reveal';import {pb,meta,ldJson} from '@/lib/pb';import {Featured,Card,Chips} from '@/components/PbCards';
export const generateMetadata=()=>meta('/journal/');
export default function P(){const d=pb('journal');const [f,...rest]=d.posts;return(<Page label="Journal" title="Notes from Haritt Group on how we build and what we learn." dots="book">
 <script type="application/ld+json" dangerouslySetInnerHTML={{__html:ldJson('/journal/')}}/>
 <Reveal><p className="text-[19px] text-mu max-w-[52ch] -mt-6 mb-16">{d.intro}</p></Reveal>
 <div className="grid gap-11">{f&&<Reveal><Featured p={f}/></Reveal>}<Chips cur="" cats={d.cats} base="/journal/"/>{rest.length>0&&<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-7 gap-y-9">{rest.map(p=><Reveal key={p.slug}><Card p={p}/></Reveal>)}</div>}</div></Page>)}
