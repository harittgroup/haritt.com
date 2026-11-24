import fs from 'fs';import path from 'path';
export type Cover={src:string;w:number;h:number;alt:string}|null;
export type Post={id:string;slug:string;url:string;title:string;excerpt:string;cat:string;catName:string;date:string;updated:string;minutes:number;cover:Cover;html:string;toc:[string,string][];end:string};
export type PBData={pages:Record<string,{title:string;desc:string;ld:string;og:string;type:string}>;posts:Post[];cats:{slug:string;name:string;desc:string}[];intro:string;publisher:{name?:string;bio?:string};live?:boolean};
export type Src='playbooks'|'journal';
const C:Partial<Record<Src,PBData>>={};
export function pb(src:Src='playbooks'):PBData{if(C[src])return C[src]!;try{C[src]=JSON.parse(fs.readFileSync(path.join(process.cwd(),'..',src+'-pages.json'),'utf8'))}catch{C[src]={pages:{},posts:[],cats:[],intro:'',publisher:{},live:false}}return C[src]!}
const srcOf=(p:string):Src=>p.startsWith('/journal/')?'journal':'playbooks';
export function meta(p:string){const d=pb(srcOf(p)),g=d.pages[p];if(!g)return {};return {...(d.live===false?{robots:{index:false,follow:true}}:{}),title:g.title,description:g.desc,alternates:{canonical:'https://haritt.com'+p},openGraph:{title:g.title,description:g.desc,url:'https://haritt.com'+p,type:g.type==='article'?'article':'website',images:[{url:g.og}]}}}
export function ldJson(p:string){const g=pb(srcOf(p)).pages[p];const m=g&&g.ld.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);return m?m[1]:''}
