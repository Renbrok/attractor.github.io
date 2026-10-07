(()=>{
 'use strict';
 const ns='http://www.w3.org/2000/svg';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const profiles={
  A1:{name:'Записи реестров об объектах',short:'Реестры',what:'Сведения об объектах, их идентификаторах и учётных записях.'},
  A2:{name:'Изменения и статусы процессов',short:'События',what:'Уведомления об изменениях, этапах и состоянии процессов.'},
  A3:{name:'Документы и файлы',short:'Документы',what:'Документы, файлы, их версии и подписи.'},
  A4:{name:'Показатели и отчётность',short:'Показатели',what:'Отчётные показатели, сводные данные и результаты мониторинга.'},
  A5:{name:'Доступ и настройки обмена',short:'Правила',what:'Служебные сведения: права доступа, схемы данных, версии и журнал обмена.'}
 };
 const profile=id=>profiles[id]||{name:id,short:id};
 const onActivate=(el,fn)=>{el.setAttribute('tabindex','0');el.setAttribute('role','button');el.onclick=e=>{e.stopPropagation();fn();};el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fn();}};};
 function prepare(data,config){
  const member=new Map(config.assignments.map(n=>[n.id,n.domain]));
  const domains=new Map(config.domains.map(d=>[d.id,d]));
  const byRoute=new Map(data.routes.map(r=>[r.id,r]));
  const bundles=config.bundles.map(b=>({...b,routes:b.routeIds.map(id=>byRoute.get(id))}));
  if(member.size!==data.nodes.length||data.nodes.some(n=>!domains.has(member.get(n.id)))||bundles.some(b=>b.routes.some(r=>!r)))throw Error('Неполная схема контуров');
  const local=data.routes.filter(r=>member.get(r.a)===member.get(r.b));
  const covered=new Set([...local.map(r=>r.id),...bundles.flatMap(b=>b.routeIds)]);
  if(covered.size!==data.routes.length||local.length+bundles.reduce((sum,b)=>sum+b.routes.length,0)!==data.routes.length)throw Error('Процессы контуров не согласованы с атласом');
  return {data,config,member,domains,bundles,local};
 }
 function layout(model,W,H){
  const cx=W/2,cy=H/2;
  const centres={resources:{x:cx-640,y:cy-355},industry:{x:cx+640,y:cy-355},social:{x:cx-640,y:cy+355},governance:{x:cx+640,y:cy+355}};
  const positions=new Map();
  for(const d of model.config.domains){
   const centre=centres[d.id],nodes=model.data.nodes.filter(n=>model.member.get(n.id)===d.id),core=nodes.filter(n=>n.core),other=nodes.filter(n=>!n.core);
   const coreRows=core.length>3?2:1,columns=Math.ceil(core.length/coreRows);
   core.forEach((n,i)=>{const row=Math.floor(i/columns),column=i%columns,rowCount=Math.min(columns,core.length-row*columns);positions.set(n.id,{x:centre.x+(column-(rowCount-1)/2)*205,y:centre.y+(coreRows===2?(row===0?-95:95):0)});});
   const anchors=new Map(other.map(n=>{const links=core.map(c=>({id:c.id,count:model.data.routes.filter(r=>r.a===n.id&&r.b===c.id||r.b===n.id&&r.a===c.id).length})).sort((a,b)=>b.count-a.count||a.id.localeCompare(b.id));return [n.id,links[0]?.id||''];}));
   other.sort((a,b)=>anchors.get(a.id).localeCompare(anchors.get(b.id))||a.name.localeCompare(b.name,'ru'));
   other.forEach((n,i)=>{const angle=-Math.PI/2+(i+.5)*Math.PI*2/other.length;positions.set(n.id,{x:centre.x+365*Math.cos(angle),y:centre.y+213*Math.sin(angle)});});
  }
  return {centres,positions,bounds:{x:cx-1180,y:cy-770,width:2400,height:1520}};
 }
 function connector(bundle,centres,W,H){
  const cx=W/2,cy=H/2;const a=centres[bundle.a],b=centres[bundle.b];
  const horizontal=a.y===b.y,vertical=a.x===b.x;
  if(horizontal)return {path:`M${a.x+445} ${a.y} C${a.x+540} ${a.y},${b.x-540} ${b.y},${b.x-445} ${b.y}`,label:{x:cx,y:a.y-19}};
  if(vertical)return {path:`M${a.x} ${a.y+270} C${a.x} ${cy-25},${b.x} ${cy+25},${b.x} ${b.y-270}`,label:{x:a.x+91,y:cy+5}};
  if(bundle.a==='resources')return {path:`M${a.x+400} ${a.y+115} C${cx+150} ${cy-220},${cx-150} ${cy+220},${b.x-400} ${b.y-115}`,label:{x:cx+70,y:cy-56}};
  const outerX=cx-1170,top=cy-735,bottom=cy+735,radius=55;
  return {path:`M${a.x} ${a.y-295} L${a.x} ${top+radius} Q${a.x} ${top},${a.x-radius} ${top} L${outerX+radius} ${top} Q${outerX} ${top},${outerX} ${top+radius} L${outerX} ${bottom-radius} Q${outerX} ${bottom},${outerX+radius} ${bottom} L${b.x-radius} ${bottom} Q${b.x} ${bottom},${b.x} ${bottom-radius} L${b.x} ${b.y+295}`,label:{x:outerX+94,y:cy}};
 }
 function render(graph,state){
  const {model,sourceNode,W,H,selected,family,query,domainId,bundleId,routeId,chooseNode,chooseDomain,chooseBundle,chooseFamily,chooseRoute}=state;
  const {data,config,member,domains}=model,{centres,positions}=layout(model,W,H);
  const picked=data.routes.find(r=>r.id===routeId),pair=picked?new Set([picked.a,picked.b]):null;
  const matches=n=>(!family||n.families.includes(family))&&(!query||n.name.toLocaleLowerCase('ru').includes(query))&&(!domainId||member.get(n.id)===domainId)&&(!bundleId||[model.bundles.find(b=>b.id===bundleId).a,model.bundles.find(b=>b.id===bundleId).b].includes(member.get(n.id)));
  let outlines='';
  for(const d of config.domains){const p=centres[d.id],matching=data.nodes.filter(n=>member.get(n.id)===d.id&&matches(n)).length;outlines+=`<g class="okur-domain${domainId===d.id?' selected':''}${matching?'':' dim'}" data-domain="${d.id}"><ellipse cx="${p.x}" cy="${p.y}" rx="475" ry="295" fill="${d.color}"/><g class="okur-domain-heading" data-domain-heading="${d.id}" aria-label="${esc('Открыть контур '+d.name)}"><text x="${p.x}" y="${p.y-263}" text-anchor="middle">${esc(d.name)}</text><text class="okur-domain-count" x="${p.x}" y="${p.y-242}" text-anchor="middle">${d.nodeCount} участников · проектный состав</text></g></g>`;}
  let internal='';
  for(const r of model.local){const a=positions.get(r.a),b=positions.get(r.b),isPicked=routeId===r.id,highlight=isPicked||selected&&(r.a===selected||r.b===selected),dim=family&&r.family!==family||domainId&&member.get(r.a)!==domainId;
   internal+=`<g class="okur-local-route${dim?' dim':''}" data-local-route="${esc(r.id)}"><title>${esc(r.aName+' — '+r.bName+' · '+profile(r.family).name+' · '+r.subject)}</title><line class="edge-hit" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/><line class="okur-local-link" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${highlight||family?data.groups.find(g=>g.id===r.family).color:'#74838a'}" stroke-width="${highlight?2.6:1}" stroke-opacity="${highlight?.85:.25}"/></g>`;
  }
  let bridges='';
  for(const bundle of model.bundles){const filtered=bundle.routes.filter(r=>(!family||r.family===family)&&(!selected||r.a===selected||r.b===selected)&&(!query||[r.a,r.b].some(id=>data.nodes.find(n=>n.id===id).name.toLocaleLowerCase('ru').includes(query)))),c=connector(bundle,centres,W,H),active=bundleId===bundle.id||picked&&bundle.routeIds.includes(picked.id),dim=!filtered.length||domainId&&![bundle.a,bundle.b].includes(domainId)||bundleId&&bundleId!==bundle.id,color=family?data.groups.find(g=>g.id===family).color:domains.get(bundle.a).color;
   bridges+=`<g class="okur-bundle${active?' selected':''}${dim?' dim':''}" data-bundle="${bundle.id}" aria-label="${esc(domains.get(bundle.a).name+' — '+domains.get(bundle.b).name+'; '+filtered.length+' исходных процессов')}"><title>${esc('Проект общего контракта: '+domains.get(bundle.a).name+' — '+domains.get(bundle.b).name+'. '+filtered.length+' исходных процессов; направления и каналы уточняются по карточкам.')}</title><path class="okur-bundle-hit" d="${c.path}"/><path class="okur-bundle-link" d="${c.path}" stroke="${color}" stroke-width="${active?7:2+Math.sqrt(bundle.routes.length)*.42}"/><g class="okur-bundle-label" transform="translate(${c.label.x},${c.label.y})"><rect x="-91" y="-14" width="182" height="28" rx="11"/><text text-anchor="middle" y="5">${filtered.length} процессов · контракт</text></g></g>`;
  }
  let expanded='';
  const expand=picked?[picked]:bundleId?model.bundles.find(b=>b.id===bundleId).routes.filter(r=>(!family||r.family===family)&&(!selected||r.a===selected||r.b===selected)):selected?data.routes.filter(r=>(r.a===selected||r.b===selected)&&(!family||r.family===family)&&member.get(r.a)!==member.get(r.b)):[];
  for(const r of expand){const a=positions.get(r.a),b=positions.get(r.b);if(member.get(r.a)===member.get(r.b))continue;expanded+=`<g data-expanded-route="${esc(r.id)}" class="okur-expanded-route"><title>${esc(r.aName+' — '+r.bName+' · '+r.subject)}</title><path class="edge-hit" d="M${a.x} ${a.y} Q${(a.x+b.x)/2} ${(a.y+b.y)/2-65} ${b.x} ${b.y}"/><path class="okur-expanded-link" d="M${a.x} ${a.y} Q${(a.x+b.x)/2} ${(a.y+b.y)/2-65} ${b.x} ${b.y}" stroke="${data.groups.find(g=>g.id===r.family).color}" stroke-opacity="${picked?.9:.24}" stroke-width="${picked?3:1.2}"/></g>`;}
  graph.innerHTML=`<g id="okur-domains">${outlines}</g><g id="okur-local-edges">${internal}</g><g id="okur-bundles">${bridges}</g><g id="okur-expanded-edges">${expanded}</g><g id="okur-participants"></g>`;
  for(const n of data.nodes){const original=sourceNode.get(n.id);if(!original)throw Error('Отсутствует значок участника '+n.id);const el=original.cloneNode(true),p=positions.get(n.id);el.classList.remove('selected','dim','internal-origin','internal-occluded','core-selected','external-focus-selected');el.classList.add('okur-participant');el.classList.toggle('okur-core',n.core);el.dataset.node=n.id;el.dataset.domain=member.get(n.id);el.style.setProperty('--ok-node-color',original.getAttribute('data-atlas-node-color')||'#506978');el.setAttribute('transform',`translate(${p.x},${p.y})`);el.classList.toggle('selected',selected===n.id||pair?.has(n.id)===true);el.classList.toggle('dim',!matches(n)||pair&&!pair.has(n.id));el.setAttribute('aria-label',n.name);const text=el.querySelector(':scope > text');if(text&&!n.core){const title=text.getAttribute('data-full-label')||n.name;const short=title.replace(/Российской Федерации/g,'РФ');text.textContent=short.length>28?short.slice(0,26)+'…':short;text.setAttribute('x',p.x<centres[member.get(n.id)].x?-24:24);text.setAttribute('y','4');text.setAttribute('text-anchor',p.x<centres[member.get(n.id)].x?'end':'start');text.classList.remove('atlas-collision-hidden');}
   const title=document.createElementNS(ns,'title');title.textContent=n.name+' · '+domains.get(member.get(n.id)).name+' (проектное место на карте)';el.append(title);onActivate(el,()=>chooseNode(n.id));graph.querySelector('#okur-participants').append(el);
  }
  graph.querySelectorAll('[data-domain-heading]').forEach(el=>onActivate(el,()=>chooseDomain(el.dataset.domainHeading)));
  graph.querySelectorAll('[data-bundle]').forEach(el=>onActivate(el,()=>chooseBundle(el.dataset.bundle)));
  graph.querySelectorAll('[data-local-route]').forEach(el=>{el.onclick=e=>{e.stopPropagation();chooseRoute(el.dataset.localRoute);};});
  graph.querySelectorAll('[data-expanded-route]').forEach(el=>{el.onclick=e=>{e.stopPropagation();chooseRoute(el.dataset.expandedRoute);};});
 }
 window.OKURDomainGraph={prepare,layout,render,profile};
})();
