(()=>{
'use strict';
const version='v244';
document.querySelectorAll('.version-pill').forEach(el=>{el.textContent=version;el.title='Обновление интерфейса · 07.10.2026';});
document.title=document.title.replace(/v\d+/g,version);
DATA.meta=DATA.meta||{};DATA.meta.version=version;
const panel=document.getElementById('detail'),popup=document.getElementById('tooltip');
let current=null,previous=[],previousStyles=[];
function buttonFor(target){const button=target.closest?.('button');if(!button||!panel.contains(button))return null;const m=(button.getAttribute('onclick')||'').match(/selectEdgeById\(['"]([^'"]+)['"]\)/);if(!m)return null;button.dataset.previewEdge=m[1];return button;}
function clear(){if(!current)return;hideTooltip();for(const [el,style] of previousStyles)if(el.isConnected){if(style===null)el.removeAttribute('style');else el.setAttribute('style',style);}for(const el of previous)if(el.isConnected)el.classList.add('hovered');current=null;previous=[];previousStyles=[];}
function position(button,event){const box=button.getBoundingClientRect(),x=event?.clientX??box.left,y=event?.clientY??box.top;const width=popup.offsetWidth,height=popup.offsetHeight;popup.style.left=Math.max(8,Math.min(innerWidth-width-8,x-width-16))+'px';popup.style.top=Math.max(8,Math.min(innerHeight-height-8,y+12))+'px';}
function preview(button,event){if(current===button)return;clear();const e=DATA.edges.find(e=>e.id===button.dataset.previewEdge);if(!e)return;previous=[...edgesLayer.children].filter(el=>el.classList.contains('hovered'));current=button;showEdgeTooltip(e,event||{clientX:button.getBoundingClientRect().left,clientY:button.getBoundingClientRect().top});for(const el of edgesLayer.children){if(el.dataset.id!==e.id||!el.classList.contains('edge'))continue;previousStyles.push([el,el.getAttribute('style')]);for(const [key,value] of [['stroke','#813e50'],['stroke-width','4px'],['stroke-opacity','1'],['opacity','1']])el.style.setProperty(key,value,'important');}position(button,event);}
panel.addEventListener('pointerover',ev=>{const button=buttonFor(ev.target);if(button)preview(button,ev);});
panel.addEventListener('pointermove',ev=>{if(current&&current.contains(ev.target))position(current,ev);});
panel.addEventListener('pointerout',ev=>{if(current&&current.contains(ev.target)&&!current.contains(ev.relatedTarget))clear();});
panel.addEventListener('focusin',ev=>{const button=buttonFor(ev.target);if(button)preview(button);});
panel.addEventListener('focusout',ev=>{if(current===ev.target)clear();});
panel.addEventListener('click',clear);
window.renUiVersion=version;
const labelStyle=document.createElement('style');labelStyle.textContent='#nodesLayer .node>text{display:block!important;visibility:visible!important;opacity:1!important}#okur-network [data-node]>text{display:block!important;visibility:visible!important;opacity:1!important}';document.head.append(labelStyle);

document.getElementById('detailToggle')?.remove();
const actualLayer='Действующая схема межведомственного обмена',proposedLayer='Предлагаемая схема межведомственного обмена';
document.querySelector('.atlas-topnav [data-atlas-mode="ATLAS"]').textContent=actualLayer;
document.querySelectorAll('[data-open-okur]').forEach(b=>b.textContent=proposedLayer);
function syncLayerTitle(){document.getElementById('atlasTitle').textContent=document.body.classList.contains('okur-active')?proposedLayer:actualLayer;}
new MutationObserver(()=>{syncLayerTitle();paintChannels137();}).observe(document.body,{attributes:true,attributeFilter:['class']});syncLayerTitle();
const layerStyle=document.createElement('style');layerStyle.textContent='.atlas-topnav{max-width:660px;flex:1;gap:10px}.atlas-topnav button{white-space:normal!important;line-height:1.3;font-size:13px;max-width:325px}.atlas-intro-title{min-width:0!important;max-width:670px}#atlasTitle{font-size:32px;line-height:1.08;max-width:470px}.okur-switch-title{max-width:600px}@media(max-width:1100px){.atlas-topnav button{font-size:11px}#atlasTitle{font-size:25px}}';document.head.append(layerStyle);

const toolbar=document.getElementById('channelToolbar134'),box=toolbar.querySelector('.channel-options137'),search=document.getElementById('channelSearch179');
const others=document.createElement('details');others.id='channel-others205';
others.innerHTML='<summary><button type="button" class="channel-others-toggle205" role="checkbox" aria-checked="false" aria-label="Выбрать все остальные каналы">☐</button><span>Остальные</span><span class="channel-others-count205"></span></summary><div class="channel-others-list205"></div>';
const list=others.querySelector('.channel-others-list205'),toggle=others.querySelector('button');
let singles=[],beforeSearchOpen=false,searching=false;
function regroup(){
 const rows=[...box.querySelectorAll('label[data-channel-row179]')];singles=rows.filter(row=>Number(row.dataset.mainMapCount181)===1);
 for(const row of singles)list.append(row);
 box.append(others);others.hidden=!singles.length;
 const checked=singles.filter(row=>row.querySelector('input').checked).length;
 toggle.setAttribute('aria-checked',checked===0?'false':checked===singles.length?'true':'mixed');toggle.textContent=checked===0?'☐':checked===singles.length?'☑':'−';
 others.querySelector('.channel-others-count205').textContent=String(singles.length);
 filterOthers();
}
function filterOthers(){const q=search.value.trim().toLocaleLowerCase('ru');if(q&&!searching){beforeSearchOpen=others.open;searching=true;}else if(!q&&searching){others.open=beforeSearchOpen;searching=false;}const matches=singles.filter(row=>!row.hidden).length;others.hidden=!singles.length||!!q&&!matches;if(q&&matches)others.open=true;}
toggle.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();const check=toggle.getAttribute('aria-checked')!=='true';for(const row of singles)row.querySelector('input').checked=check;singles[0]?.querySelector('input').dispatchEvent(new Event('change',{bubbles:true}));});
const mainEdgeIds=new Set(simulationEdges.map(e=>e.id));
const oldPaint=paintChannels137;paintChannels137=function(){
 if(!mainEdgeIds.size&&simulationEdges.length&&!document.body.classList.contains('atlas-internal-mode'))for(const edge of simulationEdges)mainEdgeIds.add(edge.id);
 const scrollables=[toolbar,box,list,...toolbar.querySelectorAll('*')].filter(el=>el===toolbar||el===box||el.scrollHeight>el.clientHeight);
 const positions=scrollables.map(el=>[el,el.scrollTop,el.scrollLeft]);const focused=document.activeElement;
 oldPaint();
 if(document.body.classList.contains('atlas-internal-mode'))for(const line of edgesLayer.querySelectorAll('.edge')){line.style.setProperty('stroke-opacity','0.1','important');line.style.setProperty('stroke-width','1','important');}
 const visibleIds=new Set(simulationEdges.map(e=>e.id)),q=search.value.trim().toLocaleLowerCase('ru');
 for(const row of box.querySelectorAll('label[data-channel-row179]')){const name=row.querySelector('input').value,edges=DATA.edges.filter(e=>mainEdgeIds.has(e.id)&&window.verifiedChannelLabels179(e).includes(name));row.dataset.mainMapCount181=String(edges.length);row.hidden=!edges.length||!!q&&!name.toLocaleLowerCase('ru').includes(q);const badge=row.querySelector('[data-channel-count179]');if(badge)badge.textContent=String(edges.filter(e=>visibleIds.has(e.id)).length);}
 regroup();
 renderChannelLegend();
 if(!selectedChannels137.size)document.getElementById('channelMatch134').textContent='Главная карта: 77 узлов · 352 связи';
 const restore=()=>{if(focused&&focused.isConnected&&document.activeElement!==focused)focused.focus({preventScroll:true});for(const [el,top,left] of positions){el.scrollTop=top;el.scrollLeft=left;}};restore();requestAnimationFrame(restore);
};
search.addEventListener('input',filterOthers);

const legend=document.createElement('aside');legend.id='channel-legend210';legend.setAttribute('aria-label','Легенда выбранных каналов');legend.hidden=true;document.getElementById('graph').parentElement.append(legend);
const legendStyle=document.createElement('style');legendStyle.textContent='#channel-legend210{position:absolute;left:16px;bottom:16px;z-index:7;width:min(340px,calc(100% - 32px));max-height:36%;overflow:auto;background:#fcf9f3f5;border:1px solid #d8cec0;padding:12px 14px;box-shadow:0 3px 12px #192a3412;color:#253747;font-size:13px}#channel-legend210[hidden],body.okur-active #channel-legend210{display:none}#channel-legend210 strong{display:block;margin-bottom:8px;font-family:Georgia,serif;font-size:17px}#channel-legend210 .legend-row210{display:flex;gap:9px;align-items:center;margin:6px 0;overflow-wrap:anywhere}#channel-legend210 .legend-line210{width:30px;height:3px;flex:0 0 30px}#channel-legend210 .small{font-size:11px;margin:8px 0 0}';document.head.append(legendStyle);
function renderChannelLegend(){const enabled=graphMode==='OVERVIEW'&&!document.body.classList.contains('atlas-internal-mode')&&selectedChannels137.size>0&&!document.body.classList.contains('okur-active');legend.hidden=!enabled;if(!enabled)return;const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const colors=new Map([...box.querySelectorAll('label[data-channel-row179]')].map(row=>[row.querySelector('input').value,row.querySelector('.channel-dot137')?.style.background||'#386c8e']));
// Apply the same colour rule to matrix routes added after the original atlas initialized.
for(const line of edgesLayer.querySelectorAll('.edge')){const e=simulationEdges.find(e=>e.id===line.dataset.id);if(!e?.main_matrix_route)continue;const cs=window.verifiedChannelLabels179(e).filter(name=>selectedChannels137.has(name)&&colors.has(name));line.dataset.selectedChannels=cs.join(';');line.style.setProperty('stroke',cs.length?colors.get(cs[0]):'#a9afb5','important');line.style.setProperty('stroke-opacity',cs.length?'1':'0.38','important');line.style.setProperty('stroke-width',cs.length?'3.4':'1.05','important');}
const lines=[...edgesLayer.querySelectorAll('.edge')],multi=lines.some(l=>l.dataset.selectedChannels?.split(';').filter(Boolean).length>1);legend.innerHTML='<strong>Выбранные каналы</strong>'+[...selectedChannels137].map(name=>{const count=lines.filter(l=>l.dataset.selectedChannels?.split(';').includes(name)).length;return '<div class="legend-row210"><span class="legend-line210" style="background:'+escape(colors.get(name)||'#386c8e')+'"></span><span>'+escape(name)+' · '+count+'</span></div>';}).join('')+'<div class="legend-row210"><span class="legend-line210" style="background:#a9afb5"></span><span>Остальные связи</span></div>'+(multi?'<p class="small">Чередующиеся цвета: у связи несколько выбранных каналов.</p>':'');}

paintChannels137();


function syncLayerIntro(){if(selectedNode||selectedEdge)return;const heading=panel.querySelector('h2')?.textContent||'',existing=panel.querySelector('[data-layer-intro210]');const mode=graphMode==='STRUCTURE'?'structure':'atlas';if(existing?.dataset.layerIntro210===mode)return;panel.innerHTML=mode==='structure'?'<div data-layer-intro210="structure"><h2>Структура органов</h2><p>Этот вид показывает подразделения выбранного ведомства, их принадлежность и документальные внутренние процессы.</p><p>Выберите ведомство и нажмите на подразделение или связь, чтобы открыть состав, передаваемые сведения и источники. В Роснедрах можно переключаться между полной структурой и внутренними связями из матрицы.</p></div>':'<div data-layer-intro210="atlas"><h2>Действующая схема межведомственного обмена</h2><p>Карта показывает участников межведомственного взаимодействия, передаваемые сведения и документальные основания связей.</p><p>Выберите узел, чтобы увидеть его связи и внутреннюю структуру. Нажмите на линию, чтобы посмотреть содержание обмена, канал и источник.</p><p>В фильтрах можно выделить нужные каналы цветом. Легенда на карте объясняет выбранные цвета; остальные связи остаются серыми.</p></div>';}

const panelHeading=document.querySelector('#rightPanel .drawer-head strong');
function selectedName(id){return nodeById[id]?.name||structureNodeById.get(id)?.name||structureDeptById.get(id)?.Registry_Name||null;}
function syncPanelHeading(){if(document.body.classList.contains('okur-active'))return;const meta=panel.querySelector('.meta')?.textContent||'',title=panel.querySelector('h2')?.textContent||'',name=selectedNode&&selectedName(selectedNode);syncLayerIntro();panelHeading.textContent=name&&(meta.includes(selectedNode)||title===name)?name:(selectedEdge?'Сведения о связи':'О слое');}
const beforeSelectNode=selectNode;selectNode=function(id){const result=beforeSelectNode(id);if(!document.body.classList.contains('okur-active'))panelHeading.textContent=selectedName(id)||'О слое';return result;};
new MutationObserver(syncPanelHeading).observe(panel,{childList:true,subtree:true});
syncPanelHeading();
})();

(()=>{
'use strict';
const style=document.createElement('style');style.textContent=`@media(max-width:820px){
:root{--mobile-nav-height:calc(62px + env(safe-area-inset-bottom,0px))}
body{padding-bottom:0}.app{height:calc(100vh - var(--mobile-nav-height));height:calc(100dvh - var(--mobile-nav-height));grid-template-rows:58px 44px auto minmax(0,1fr);grid-template-areas:"top" "search" "intro" "main"}
#atlasNodeSearch{grid-area:search;position:relative;inset:auto;width:auto;min-width:0;margin:4px 12px;z-index:86;align-self:center}#atlasNodeSearch .atlas-node-search-box{height:36px;box-shadow:none}
.atlas-intro{display:block!important;min-width:0;padding:8px 14px 10px;min-height:0}.atlas-intro-title{display:block;max-width:none!important;width:100%;min-width:0!important}#atlasTitle{font-size:22px!important;line-height:1.12!important;letter-spacing:-.025em;max-width:none;width:100%;overflow-wrap:break-word}.atlas-intro>p,.atlas-eyebrow{display:none}
.atlas-mobile-nav{height:var(--mobile-nav-height);box-sizing:border-box;padding:5px 10px calc(5px + env(safe-area-inset-bottom,0px));gap:8px}.atlas-mobile-nav button{font-size:12px;line-height:1.15;border-radius:4px;padding:6px 5px}.atlas-mobile-nav button.active{background:#eae3d6}.atlas-mobile-nav button span{display:block;font-size:10px;line-height:1.2;font-weight:400;margin-top:3px}.main{min-height:0;height:auto!important;margin:8px}
.right{padding-bottom:calc(var(--mobile-nav-height) + 12px)}
}@media(max-width:360px){#atlasTitle{font-size:20px!important}.atlas-mobile-nav button{font-size:11px}}`;document.head.append(style);
const search=document.getElementById('atlasNodeSearch'),home=document.createComment('desktop-search238');search.before(home);const media=matchMedia('(max-width:820px)');function placeSearch(){if(media.matches)document.querySelector('.atlas-intro').before(search);else home.after(search);}placeSearch();media.addEventListener('change',placeSearch);
const atlas=document.getElementById('atlasMobileAtlas238'),okur=document.getElementById('atlasMobileOkur238');
function sync(){const proposed=document.body.classList.contains('okur-active');for(const [button,active] of [[atlas,!proposed],[okur,proposed]]){button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));}}
atlas.onclick=()=>{window.renReturnMainMap();document.body.classList.remove('detail-open','channel-filter-open','filters-open');sync();};
okur.onclick=()=>{if(!document.body.classList.contains('okur-active'))document.querySelector('.atlas-topnav [data-open-okur]').click();document.body.classList.remove('detail-open','channel-filter-open','filters-open');};
new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});sync();requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')));
})();
