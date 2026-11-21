const {chromium}=require('playwright');
(async()=>{const wk=process.argv[2];const b=await chromium.launch();
const pages={haritt:'https://haritt.com/',developers:'https://developers.haritt.com/',hv:'https://thehvverse.com/'};
for(const [n,u] of Object.entries(pages)){for(const [d,v,s] of [['desktop',{width:1440,height:900},1],['mobile',{width:390,height:844},2]]){
try{const p=await b.newPage({viewport:v,deviceScaleFactor:s});await p.goto(u,{waitUntil:'networkidle',timeout:45000});await p.screenshot({path:`changelog/img/${wk}-${n}-${d}.png`});await p.close()}catch(e){console.log('skip',n,d,e.message)}}}
await b.close()})()
