
const fs=require('fs'),path=require('path'),crypto=require('crypto'),vm=require('vm');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(root+'/source/app.html','utf8');
const external=[...source.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split('?')[0]);
let scripts=[];let html=source.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/g,(all,attrs,body)=>{const src=attrs.match(/src="([^"]+)"/);scripts.push(src?fs.readFileSync(root+'/'+src[1].split('?')[0],'utf8'):body);return '';});
let code=scripts.join('\n;\n');const payloads=[];
function payload(regex,label){const match=code.match(regex);if(!match)throw Error('Missing payload '+label);const json=JSON.parse(match[1]);const token='__REN_PAYLOAD_'+payloads.length+'__';payloads.push({label,json,token});code=code.replace(match[1],token);}
payload(/const DATA=([^\n]+);/,'DATA');payload(/STRUCTURE_RAW=([^\n]+);/,'STRUCTURE_RAW');payload(/window\.ROSNEDRA_MATRIX_V02=([^\n]+);/,'ROSNEDRA_MATRIX_V02');
const unused={};const matrix=payloads.find(p=>p.label==='ROSNEDRA_MATRIX_V02').json;
for(const key of ['candidates','instructions','research_notes','workbook_path','source_model','new_official_sources_rechecked','legacy_sources_rechecked'])if(key in matrix&&!new RegExp('(?:\\.|["\x27])'+key+'\\b').test(code)){unused[key]=matrix[key];delete matrix[key];}
fs.writeFileSync(root+'/archive/unused-v244.json',JSON.stringify({note:'Не подключаемые справочные поля матрицы. Источники и действующие записи сохранены в приложении.',matrix:unused}));
const counts=new Map();function count(v){if(typeof v==='string'&&v.length>=65)counts.set(v,(counts.get(v)||0)+1);else if(Array.isArray(v))v.forEach(count);else if(v&&typeof v==='object')Object.values(v).forEach(count);}payloads.forEach(p=>count(p.json));
const strings=[...counts].filter(([s,n])=>n>=2&&(n-1)*Buffer.byteLength(s)>n*12+30).map(([s])=>s),indices=new Map(strings.map((s,i)=>[s,i]));
for(const p of payloads){const literal=JSON.stringify(p.json).replace(/"(?:[^"\\]|\\.)*"/g,t=>{const i=indices.get(JSON.parse(t));return i===undefined?t:'__renStrings244['+i+']';});code=code.replace(p.token,literal);}
code='const __renStrings244='+JSON.stringify(strings)+';\n'+code;
code=code.replace("requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')));",'');
code=code.replace('function startSimulation(){','function startSimulation(){if(window.renBooting){window.renDeferredBuilds=(window.renDeferredBuilds||0)+1;return;}window.renGraphBuilds=(window.renGraphBuilds||0)+1;');
code=code.replace(/new URL\('data\.json\?v=okur-\d+',document\.currentScript\.src\)/,"new URL('okur/data.json?v=244',location.href)");
code=code.replace("domains.json?v=okur-12","domains.json?v=244").replace("fetch(url,{cache:'no-cache'})","fetch(url)");
code=code.replace("if(location.hash==='#okur')open();","if(location.hash==='#okur'&&!window.renBooting)open();");
code+=String.raw`
;(async()=>{window.renBooting=false;focusSet.clear();selectedNode=null;selectedEdge=null;graphMode='OVERVIEW';startSimulation();await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
if(location.hash==='#okur'){document.querySelector('.atlas-topnav [data-open-okur]').click();await new Promise((resolve,reject)=>{if(document.body.classList.contains('okur-active'))return resolve();const observer=new MutationObserver(()=>{if(document.body.classList.contains('okur-active')){observer.disconnect();clearTimeout(timer);resolve();}});observer.observe(document.body,{attributes:true,attributeFilter:['class']});const timer=setTimeout(()=>{observer.disconnect();reject(Error('Layer load failed'));},30000);});}
document.querySelector('.app').setAttribute('aria-busy','false');document.documentElement.dataset.bootState='ready';document.getElementById('renLoading244').remove();window.renReady=true;performance.mark('ren-ready');})().catch(window.renBootError);
`;
const hash=crypto.createHash('sha256').update(code).digest('hex').slice(0,12),asset='assets/app-v244-'+hash+'.js';fs.mkdirSync(root+'/assets',{recursive:true});fs.writeFileSync(root+'/'+asset,code);for(const name of fs.readdirSync(root+'/assets')){if(/^app-v244-[a-f0-9]{12}\.js$/.test(name)&&name!==path.basename(asset))fs.unlinkSync(path.join(root,'assets',name));}
html=html.replace(/<link rel="stylesheet" href="okur\/atlas-layer\.css[^"]*">/,'<style>'+fs.readFileSync(root+'/okur/atlas-layer.css','utf8')+'</style>');
html=html.replace('<html lang="ru">','<html lang="ru" data-boot-state="loading">').replace('<div class="app">','<div class="app" aria-busy="true">');
const boot=String.raw`<style>html:not([data-boot-state="ready"]) .app{visibility:hidden}#renLoading244{position:fixed;inset:0;display:grid;place-content:center;gap:12px;text-align:center;background:#faf7f0;color:#183248;z-index:500;font:15px/1.5 "Segoe UI",sans-serif}#renLoading244 strong{font:40px Georgia,serif;color:#101b24}#renLoading244 p{margin:0}#renLoading244 button{padding:9px 16px;border:1px solid #d7cfc1;background:#fffdf8;color:#183248;cursor:pointer}</style><script>window.renBooting=true;window.renBootError=function(){if(window.renReady)return;document.documentElement.dataset.bootState='error';const box=document.getElementById('renLoading244');if(box){box.querySelector('p').textContent='Не удалось загрузить карту. Повторите попытку.';box.querySelector('button').hidden=false;}};window.addEventListener('error',window.renBootError);</script>`;
html=html.replace('</head>',boot+'<script defer src="'+asset+'" onerror="renBootError()"></script></head>').replace(/(<body[^>]*>)/,'$1<div id="renLoading244" role="status" aria-live="polite"><strong>РЭН</strong><p>Загрузка карты…</p><button type="button" hidden onclick="location.reload()">Повторить загрузку</button></div>');
fs.writeFileSync(root+'/index.html',html);
const standalone=html.replace('<script defer src="'+asset+'" onerror="renBootError()"></script>','').replace('</body>','<script>'+code.replace(/<\/script/gi,'<\\/script')+'</script></body>');
// Offline output embeds lazy OKUR data without introducing an initial network request.
const offline=standalone.replace("loading=loading||Promise.all([dataUrl,new URL('domains.json?v=244',dataUrl)].map(url=>fetch(url).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json();})));","loading=loading||Promise.resolve(["+fs.readFileSync(root+'/okur/data.json','utf8')+','+fs.readFileSync(root+'/okur/domains.json','utf8')+']);');
if(offline===standalone)throw Error('Offline OKUR replacement failed');fs.mkdirSync(root+'/dist',{recursive:true});fs.writeFileSync(root+'/dist/РЭН_v244.html',offline);
const before=Buffer.byteLength(source)+external.reduce((s,p)=>s+fs.statSync(root+'/'+p).size,0);const report={version:'v244',htmlBytes:Buffer.byteLength(html),runtimeBytes:Buffer.byteLength(code),previousInitialBytes:before,currentInitialBytes:Buffer.byteLength(html)+Buffer.byteLength(code),initialScriptRequestsBefore:external.length,initialScriptRequestsAfter:1,pooledStrings:strings.length,archivedFields:Object.keys(unused),asset};fs.writeFileSync(root+'/source/build-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
