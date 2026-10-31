import {translateMarkup} from '../localization/i18n.js';
import {t} from '../localization/i18n.js';
import {releaseCover} from '../catalog/catalog-artwork.js';
import {releases} from '../catalog/catalog-data.js';
import {animateStoryTimeline} from './story-animation.js';
import {mountStoryDetails} from './story-details.js';
type Source={label:string;url:string};
type Chapter={label:string;title:string;text:string;note?:string;sources:Source[]};
const official=(url:string):Source=>({label:t('官方资料'),url});
const interview=(url:string):Source=>({label:t('创作者访谈'),url});
const amy='https://music.fanplus.co.jp/news/20190413321e430f7';
const elma='https://sp.universal-music.co.jp/yorushika/elma/';
const chapters:Chapter[]=[
 {label:t('序章 · 作品背景'),title:t('两张专辑，一段彼此回应的故事'),text:t('《だから僕は音楽を辞めた》与《エルマ》围绕艾米和艾尔玛展开。前者以一位离开音乐的青年及他写给艾尔玛的歌与信为线索；后者换到艾尔玛的视角，追随他的足迹。它们更像两个人留下的记录，而不是按章节写明的小说。'),sources:[interview(amy),official(elma)]},
 {label:t('第一章 · 相遇与留下的声音'),title:t('艾米与艾尔玛'),text:t('艾米与艾尔玛共同度过了一段重要的时光，音乐也成为连接两人的方式。创作者在采访中没有把他们的关系限定成某一种身份；比起急着给关系命名，可以先留意歌曲中反复出现的记忆、距离与表达。'),note:t('人物关系与相遇细节有不同读法；这里保留作品的开放性。'),sources:[interview(amy)]},
 {label:t('第二章 · 艾米的旅途'),title:t('离开、远行与写给她的信'),text:t('在第一张专辑的设定中，离开音乐的青年踏上旅途，将自己的歌、歌词与信件寄给艾尔玛。那些作品把旅途中的风景与对过去的回望交织在一起，逐渐构成他留给她的声音。'),sources:[interview(amy),official(elma)]},
 {label:t('第三章 · 艾尔玛的旅途'),title:t('沿着信件中的足迹前行'),text:t('第二张专辑将视角交给艾尔玛：她前往青年曾经到过的地方，在沿途的街景、教堂与海边重新面对两人之间的记忆。日记与歌曲共同构成她对这段旅途的记录。'),note:t('旅途中的地点与场景可以结合日记和歌曲阅读。'),sources:[official(elma)]},
 {label:t('第四章 · 回声'),title:t('从《エルマ》到《エイミー》'),text:t('两张专辑各有一首以对方名字命名的歌曲。把它们放在一起听，可以留意叙事视角如何变化：从写给某个人，到留下的人如何重新理解这段关系。'),note:t('“回应”和人物内心的具体解释属于听众视角，并非唯一答案。'),sources:[official(elma)]}
];
const releasesAfter=[{id:'15',date:'2020.07.29',name:'盗作',text:t('故事转换到另一位人物：一名盗用音乐的男子。官方介绍将专辑与一本描写其独白和与少年相遇的小说联系起来。'),url:'https://yorushika.com/news/detail/11127'},{id:'18',date:'2021.01.27',name:'創作',text:t('以春为主题的 EP。创作者曾在采访中讨论“盗作”与“创作”的关系；概念上的呼应不等于可以直接认定两部作品是同一条人物剧情。'),url:'https://sp.universal-music.co.jp/yorushika/sousaku/'}];
const detailsKeys=['prologue','meeting','amy-journey','elma-journey','echo','plagiarism','creation'];
const storyAdditions=[
 '专辑的线索从一只寄到艾尔玛手中的木箱展开：里面收有青年旅途中写下的音乐与书信。续作则以她收到信件后的旅行为视角，让两张唱片形成前后呼应。',
 '两人的相处并没有被官方解释成一段完整的传记。可以从书信、歌曲和后来留下的日记，感受音乐如何将他们的记忆连接起来。',
 '青年在瑞典旅行时写下音乐与信件。专辑以艾尔玛打开木箱、开始阅读的瞬间作为叙事起点，听众也由此逐渐接触他的旅途与心绪。',
 '艾尔玛受到青年书信的影响，追寻他曾到过的地方。续作收录以她为视角的歌曲，限定版中的照片与日记则补充了这段旅途的呈现方式。',
 '《エルマ》延续前作的故事，也改变了观看同一段记忆的角度。两首以人物命名的歌曲可以作为对照的聆听线索；各自的含义仍留给听众理解。',
 '《盗作》另起一个以音乐窃贼为中心的故事，通过小说与专辑共同呈现人物的独白。它与艾米、艾尔玛的故事并非已确认的同一叙事。',
 '《創作》是一张以春为主题的五曲 EP，其中包括《春泥棒》和《嘘月》。它延续了对音乐与创作的思考，但人物之间的联系没有被官方确认为同一条故事线。'
];
function sourceButton(source:Source,index:number,count:number){const button=document.createElement('button');button.className='quiet';button.textContent=source.label+(count>1?' '+(index+1):'');button.onclick=()=>void window.storySources.open(source.url);return button;}
export function mountStoryTimeline(host:HTMLElement,open:(id:string)=>void,animate=false){
 host.innerHTML=translateMarkup('<h1>故事时间线</h1><p>根据官方作品资料与创作者采访，沿人物经历阅读。含剧情信息；人物关系与故事细节保留想象空间。</p><div class="story-controls"><span>拖动或横向滚动，探索故事</span><div><button type="button" class="quiet" data-direction="previous" aria-label="向左浏览时间线">←</button><button type="button" class="quiet" data-direction="next" aria-label="向右浏览时间线">→</button></div></div><div class="story-viewport" tabindex="0" aria-label="故事时间线，可左右滚动"><div class="story-track"></div></div>');
 const viewport=host.querySelector<HTMLElement>('.story-viewport')!;const track=host.querySelector<HTMLElement>('.story-track')!;
 const nodes=[...chapters.map((chapter,index)=>({label:chapter.label,title:chapter.title,text:chapter.text,note:chapter.note,sources:chapter.sources,id:index<3?'6':'2'})),...releasesAfter.map(entry=>({label:entry.date,title:entry.name,text:entry.text,note:undefined,sources:[official(entry.url)],id:entry.id}))];
 for(const [index,node] of nodes.entries()){
  const article=document.createElement('article');article.className='story-node '+(index%2?'below':'above');const marker=document.createElement('span');marker.className='story-marker';marker.setAttribute('aria-hidden','true');const body=document.createElement('div');body.className='story-node-body';const label=document.createElement('span');label.className='story-label';label.textContent=node.label;const inner=document.createElement('div');inner.className='story-node-inner';const artwork=document.createElement('div');artwork.className='story-artwork';const image=document.createElement('img');image.draggable=false;image.src='../renderer/yorushika-official-mark.svg';image.alt='';artwork.append(image);const release=releases.find(item=>item.id===node.id);if(release)void releaseCover(window.collection,release).then(url=>{if(url&&image.isConnected){image.src=url;image.classList.add('has-artwork');}});const copy=document.createElement('div');copy.className='story-copy';const heading=document.createElement('h2');heading.textContent=node.title;const paragraph=document.createElement('p');paragraph.textContent=node.text;copy.append(heading);if(release){const released=document.createElement('p');released.className='story-release-date';released.textContent=t('专辑发行 ·')+' '+release.date;copy.append(released);}copy.append(paragraph);const extra=document.createElement('p');extra.textContent=t(storyAdditions[index]);copy.append(extra);if(node.note){const note=document.createElement('p');note.className='story-note';note.textContent=t('阅读提示：')+node.note;copy.append(note);}const actions=document.createElement('div');actions.className='story-actions';const browse=document.createElement('button');browse.className='quiet';browse.textContent=t('浏览作品');browse.disabled=!release;browse.onclick=()=>open(node.id);actions.append(browse);node.sources.forEach(source=>{const same=node.sources.filter(item=>item.label===source.label);actions.append(sourceButton(source,same.indexOf(source),same.length));});mountStoryDetails(actions,detailsKeys[index],node.title,node.label,node.text);copy.append(actions);inner.append(artwork,copy);body.append(label,inner);article.append(marker,body);track.append(article);
 }
 if(animate)animateStoryTimeline(viewport,track);
 viewport.addEventListener('dragstart',event=>event.preventDefault());
 let pointer:number|null=null,startX=0,startScroll=0,dragging=false;
 viewport.addEventListener('pointerdown',event=>{if(event.button!==0||(event.target as HTMLElement).closest('button,a,input,select'))return;pointer=event.pointerId;startX=event.clientX;startScroll=viewport.scrollLeft;dragging=false;});
 viewport.addEventListener('pointermove',event=>{if(pointer!==event.pointerId)return;const distance=event.clientX-startX;if(!dragging&&Math.abs(distance)>5){dragging=true;viewport.setPointerCapture(event.pointerId);viewport.classList.add('dragging');}if(dragging){event.preventDefault();viewport.scrollLeft=startScroll-distance;}});
 const finish=(event:PointerEvent)=>{if(pointer!==event.pointerId)return;pointer=null;viewport.classList.remove('dragging');};viewport.addEventListener('pointerup',finish);viewport.addEventListener('pointercancel',finish);
 for(const button of host.querySelectorAll<HTMLButtonElement>('[data-direction]'))button.onclick=()=>viewport.scrollBy({left:(button.dataset.direction==='next'?1:-1)*Math.max(320,viewport.clientWidth*.7),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}
