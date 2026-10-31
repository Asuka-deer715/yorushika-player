import {releases,normalize,type Category,type Release} from './catalog-data.js';
import type {MediaRecord} from '../shared/library.js';
const categories:[Category,string][]=[['band','乐队专辑'],['nbuna','n-buna'],['suis','suis'],['collab-n','合作曲（n）'],['collab-s','合作曲（s）']];
const categoryIntro:Record<Category,{title:string;description:string}>={
 band:{title:'ヨルシカ',description:'由创作者 n-buna 与主唱 suis 组成的日本乐队。以音乐与故事，描绘记忆、夏天和那些难以言说的心绪。'},
 nbuna:{title:'n-buna',description:'ヨルシカ的吉他手与创作者，曾以 Vocaloid 音乐人的身份发表作品，也持续参与音乐创作。'},
 suis:{title:'suis',description:'ヨルシカ的主唱。除了乐队作品，也以个人身份演唱及参与不同音乐人的创作。'},
 'collab-n':{title:'n-buna · 合作作品',description:'收录 n-buna 与其他音乐人共同创作、制作或参与的作品。'},
 'collab-s':{title:'suis · 合作作品',description:'收录 suis 与其他音乐人合作，以及作为客座歌手参与的作品。'}
};
export class CatalogView {
 private category:Category='band';private selected:Release|null=null;
 constructor(private play:(item:MediaRecord,queue:MediaRecord[])=>void){}
 mount(host:HTMLElement,records:MediaRecord[]){
  host.replaceChildren();const heading=document.createElement('h1');heading.textContent=categoryIntro[this.category].title;host.append(heading);
  const note=document.createElement('p');note.textContent=categoryIntro[this.category].description;host.append(note);
  const tabs=document.createElement('div');tabs.className='catalog-tabs';for(const [id,label] of categories){const button=document.createElement('button');button.className='quiet';button.textContent=label;button.setAttribute('aria-pressed',String(this.category===id));button.onclick=()=>{this.category=id;this.selected=null;this.mount(host,records)};tabs.append(button);}host.append(tabs);
  if(this.selected){const release=this.selected;const back=document.createElement('button');back.className='quiet';back.textContent='返回作品列表';back.onclick=()=>{this.selected=null;this.mount(host,records)};host.append(back);const title=document.createElement('h2');title.textContent=release.name;title.className='catalog-title';host.append(title);const date=document.createElement('p');date.textContent=release.date;host.append(date);const list=document.createElement('div');list.className='catalog-track-list';const playable=release.tracks.flatMap(track=>records.filter(record=>record.kind==='audio'&&!record.missing&&normalize(record.name)===normalize(track)));for(const [index,track] of release.tracks.entries()){const row=document.createElement('div');row.className='catalog-track';const label=document.createElement('span');label.textContent=String(index+1).padStart(2,'0')+'  '+track;row.append(label);const matches=playable.filter(item=>normalize(item.name)===normalize(track));if(!matches.length){const status=document.createElement('small');status.textContent='待收录';row.append(status);}else for(const item of matches){const play=document.createElement('button');play.className='quiet';play.textContent='核对并播放 · '+item.name;play.onclick=()=>this.play(item,playable);row.append(play);}list.append(row);}host.append(list);return;}
  const grid=document.createElement('div');grid.className='catalog-grid';for(const release of releases.filter(item=>item.category===this.category).sort((a,b)=>b.date.localeCompare(a.date))){const card=document.createElement('button');card.className='catalog-card';const art=document.createElement('div');art.className='catalog-art';const logo=document.createElement('img');logo.src='../renderer/yorushika-official-mark.svg';logo.alt='';const play=document.createElement('span');play.className='catalog-hover';play.textContent='查看曲目';art.append(logo,play);const name=document.createElement('strong');name.textContent=release.name;const date=document.createElement('small');date.textContent=release.date;card.append(art,name,date);card.onclick=()=>{this.selected=release;this.mount(host,records)};grid.append(card);}host.append(grid);
 }
}
