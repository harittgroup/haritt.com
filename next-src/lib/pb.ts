import fs from 'fs';import path from 'path';
export type Cover={src:string;w:number;h:number;alt:string}|null;
export type Post={id:string;slug:string;url:string;title:string;excerpt:string;cat:string;catName:string;date:string;updated:string;minutes:number;cover:Cover;html:string;toc:[string,string][];end:string};
export type PBData={pages:Record<string,{title:string;desc:string;ld:string;og:string;type:string}>;posts:Post[];cats:{slug:string;name:string;desc:string}[];intro:string;publisher:{name?:string;bio?:string}};
let C:PBData|null=null;
export function pb():PBData{if(C)return C;try{C=JSON.parse(fs.readFileSync(path.join(process.cwd(),'..','playbooks-pages.json'),'utf8'))}catch{C={pages:{},posts:[],cats:[],intro:'',publisher:{}}}return C!}
export function meta(p:string){const g=pb().pages[p];if(!g)return {};return {title:g.title,description:g.desc,alternates:{canonical:'https://haritt.com'+p},openGraph:{title:g.title,description:g.desc,url:'https://haritt.com'+p,type:g.type==='article'?'article':'website',images:[{url:g.og}]}}}
export function ldJson(p:string){const g=pb().pages[p];const m=g&&g.ld.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);return m?m[1]:''}
