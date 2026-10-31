import type {Category,Release} from './catalog-data.js';

function collaboration(id:string,name:string,date:string,category:Category,artist:string,role:string,tracks:string[],source:string):Release {
 return {id:'collab-'+id,name,date,category,artist,credit:artist+' · '+role,tracks,source};
}
const n=(id:string,name:string,date:string,artist:string,role:string,source:string,tracks=[name])=>collaboration('n-'+id,name,date,'collab-n',artist,role,tracks,source);
const s=(id:string,name:string,date:string,artist:string,role:string,source:string,tracks=[name])=>collaboration('s-'+id,name,date,'collab-s',artist,role,tracks,source);
const official=(id:string)=>'https://yorushika.com/news/detail/'+id;

/** Verified releases selected by the user; dates identify the listed release, not every later reissue. */
export const collaborationReleases:Release[]=[
 n('ao-minasoko','青に水底','2017-03-08','三月のパンタシア','作词、作曲、编曲',official('11116')),
 n('koi-otosu','恋を落とす','2018-11-21','三月のパンタシア','作词、作曲、编曲',official('11110')),
 n('gairo','街路、ライトの灯りだけ','2019-03-13','三月のパンタシア','作词、作曲、编曲',official('11108')),
 n('kemuri','煙','2020-09-30','三月のパンタシア','作词、作曲、编曲',official('11191')),
 n('kimi-janai','君じゃない誰かと','2017-04-26','上野優華','作曲、编曲',official('11115')),
 n('cake','ケーキを焼く','2017-05-17','さユり','编曲',official('11114')),
 n('rinne','輪廻','2018-07-04','みゆはん','编曲',official('11113')),
 n('fantasic','ファンタジック','2018-11-07','井上苑子','作词、作曲、编曲',official('11112')),
 n('concerto','可能性のコンチェルト','2018-11-14','つばきファクトリー','作曲',official('11111')),
 n('ash-remix','ASH feat. Vaundy (n-buna from ヨルシカ Remix)','2020-10-28','Nulbarich','Remix',official('11199')),
 n('hikari-are','光あれ','2021-01-20','岡野昭仁','作词',official('11539')),
 n('instant','インスタント','2023-08-23','岡野昭仁','作词、作曲、编曲',official('11540')),
 n('diamonds','Diamonds','2021-06-23','上白石萌音','编曲',official('11273')),
 n('hatsukoi','初恋','2021-07-16','神はサイコロを振らない × アユニ・D','作曲、编曲',official('11310')),
 n('dinosaur','真夏のダイナソー','2021-06-23','日食なつこ','编曲',official('11330')),
 n('chiharu','ちはる','2022-03-09','キタニタツヤ','吉他',official('11376')),
 n('your-trip','your trip','2022-03-16','chilldspot','编曲',official('11371')),
 n('ex-darling','ex ダーリン','2022-04-18','クリープハイプ','编曲',official('11381')),
 n('kiken-remix','キケンナアソビ (n-buna from ヨルシカ Remix)','2021-07-07','クリープハイプ','Remix',official('11306')),
 n('shinzo','心臓','2022-10-19','藍井エイル','作词、作曲、编曲',official('11457')),
 n('tono','遠野','2023-03-22','平畑徹也','吉他',official('11460')),
 n('haru-no-yume','春の夢','2023-04-12','JUNNA','作词、作曲、编曲',official('11492')),
 n('balk','B∀LK','2023-01-18','SawanoHiroyuki[nZk]','吉他；suis 演唱',official('11667')),
 n('hello','ハローハロー / また明日','2021-07-07','てれび戦士','歌曲创作与制作',official('11278'),['ハローハロー','また明日']),
 n('star-night-snow','スターナイトスノウ','2017-02-01','Orangestar','作词、编曲 · SNOW MIKU 2017',official('11117')),
 n('natsu-no-kyokai','夏の境界','2016-12-01','田中あいみ','作词、作曲、编曲 · Project LUX',official('11119')),
 n('gunjou','その群青が愛しかったようだった','2016-08-01','ヤギヌマカナ','作词、作曲、编曲 · CHUNITHM AIR',official('11118')),
 n('suisogaku','水奏楽','2021-02-22','Cornelius','广告音乐合作',official('11247')),
 s('tomoshiboshi','灯星','2025-06-27','haruka nakamura','演唱',official('11814'),['灯星','スターライト','この夏の光']),
 s('romance','先日はロマンス','2023-03-22','平畑徹也','演唱',official('11459')),
 s('balk','B∀LK','2023-01-18','SawanoHiroyuki[nZk]','演唱；n-buna 吉他',official('11458')),
 s('last-heart','最後の心臓','2022-02-09','MONDO GROSSO','演唱',official('11365')),
 s('melt','melt (with suis from ヨルシカ)','2019-10-02','TK from 凛として時雨','客座演唱',official('11345')),
 s('heikousen','平行線','2021-02-05','Eve','客座演唱',official('11241')),
 s('toki','時をめくる指','2020-04-10','下村陽子','客座演唱',official('44')),
 s('suiseibiyori','彗星日和','2025-11-13','塊魂シリーズ SOUND TEAM','演唱 · 游戏合作',official('11698'))
];
const albums:Record<string,string>={
 'collab-n-ao-minasoko':'あのときの歌が聴こえる',
 'collab-n-koi-otosu':'ピンクレモネード',
 'collab-n-gairo':'ガールズブルー・ハッピーサッド',
 'collab-n-kemuri':'ブルーポップは鳴りやまない',
 'collab-n-cake':'ミカヅキの航海',
 'collab-n-rinne':'ひきこもり情報弱者',
 'collab-n-kimi-janai':'友達ごっこ'
};
for(const item of collaborationReleases)item.album=albums[item.id];
