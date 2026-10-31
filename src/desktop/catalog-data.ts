export type Category='band'|'nbuna'|'suis'|'collab-n'|'collab-s';
export interface Release {id:string;name:string;date:string;category:Category;tracks:string[];source:string}
const official='https://yorushika.com/discography/detail/';
function release(id:string,name:string,date:string,category:Category,tracks:string):Release{return {id,name,date,category,tracks:tracks.split('|').filter(Boolean),source:official+id+'/'};}
export const releases:Release[]=[
 release('70','二人称','2026-03-04','band','早朝、郵便受け|雲になる|花も騒めく|魔性|プレイシック|ポスト春|太陽|晴る|忘れてください|修羅|火星人|ルバート|火葬|アポリア|へび|うめき|啄木鳥|ヒッチコック|月光浴|千鳥|櫂|海へ'),
 release('30','幻燈','2023-04-05','band','夏の肖像|都落ち|ブレーメン|チノカテ|雪国|月に吠える|451|パドドゥ|又三郎|靴の花火|老人と海|さよならモルテン|いさな|左右盲|アルジャーノン|第一夜|第ニ夜|第三夜|第四夜|第五夜|第六夜|第七夜|第八夜|第九夜|第十夜'),
 release('18','創作','2021-01-27','band','強盗と花束|春泥棒|創作|風を食む|嘘月'),
 release('15','盗作','2020-07-29','band','音楽泥棒の自白|昼鳶|春ひさぎ|爆弾魔|青年期、空き巣|レプリカント|花人局|朱夏期、音楽泥棒|盗作|思想犯|逃亡|幼年期、思い出の中|夜行|花に亡霊'),
 release('2','エルマ','2019-08-28','band','車窓|憂一乗|夕凪、某、花惑い|雨とカプチーノ|湖の街|神様のダンス|雨晴るる|歩く|心に穴が空いた|森の教会|声|エイミー|海底、月明かり|ノーチラス'),
 release('6','だから僕は音楽を辞めた','2019-04-10','band','8/31|藍二乗|八月、某、月明かり|詩書きとコーヒー|7/13|踊ろうぜ|六月は雨上がりの街を書く|五月は花緑青の窓辺から|夜紛い|5/6|パレード|エルマ|4/10|だから僕は音楽を辞めた'),
 release('7','負け犬にアンコールはいらない','2018-05-09','band','前世|負け犬にアンコールはいらない|爆弾魔|ヒッチコック|落下|準透明少年|ただ君に晴れ|冬眠|夏、バス停、君を待つ'),
 release('8','夏草が邪魔をする','2017-06-28','band','夏陰、ピアノを弾く|カトレア|言って。|あの夏に咲け|飛行|靴の花火|雲と幽霊'),
 release('9','月を歩いている','2016-07-06','nbuna','モノローグ|ルラ|三月と狼少年|歌う睡蓮|花降らし|落花|泣いた振りをした|白ゆき|ラプンツェル|落陽|白ゆきの独白|セロ弾き群青|それでもいいよ。|かぐや|エピローグ'),
 release('10','花と水飴、最終電車','2015-07-22','nbuna','もうじき夏が終わるから|無人駅|始発カフカ|ウミユリ海底譚|昼青|拝啓、夏に溺れる|ヒグレギ|透明エレジー|夜祭前に|メリュー|着火、カウントダウン|敬具|ずっと空を見ていた|夜明けと蛍|花と水飴、最終電車'),
 release('11','カーテンコールが止む前に','2014-04-26','nbuna','一人きりロックショー|スロイド|透明エレジー|アイラ|また雨が降ったら|七月、影法師、藍色、ロッカー|夕立ち(inst)|背景、夏に溺れる|カーテンコールが止む前に|ウミユリ海底譚|ハイカラ色の|夜に染まるまで|劇場愛歌|さよならワンダーノイズ'),
];
const singles:[string,string,Category][]=[['雲を抜け風下へ私だけ','2026-10-14','band'],['あぶく','2026-04-22','band'],['茜','2026-02-04','band'],['斜陽','2023-05-08','band'],['テレパス','2023-01-12','band'],['猫日','2026-07-17','suis'],['紙ひこうき','2025-02-27','suis'],['若者のすべて','2024-06-21','suis'],['星めぐる詩','2024-02-23','suis'],['Travelers','2023-03-23','suis'],['サンサーラ','2022-12-23','suis'],['少年時代 (あの夏のルカ ver.)','2021-06-02','suis'],['Silence feat. Sarah Furukawa','2019-05-10','nbuna'],['ポップス','2026-09-23','collab-n'],['Silence feat. Sarah Furukawa','2019-05-10','collab-n'],['風のアンセム','2026-04-14','collab-s'],['Synchrome','2025-04-16','collab-s'],['ソウルズ','2024-09-25','collab-s'],['vous','2024-05-15','collab-s'],['ナイトルーティーン','2023-06-14','collab-s'],['宇宙の季節','2022-12-07','collab-s']];
for(const [name,date,category] of singles)releases.push({id:`${category}-${name}`,name,date,category,tracks:[name],source:'https://yorushika.com/discography/'});
export function normalize(value:string){return value.normalize('NFKC').trim().toLocaleLowerCase().replace(/[\s\p{P}\p{S}]/gu,'');}
