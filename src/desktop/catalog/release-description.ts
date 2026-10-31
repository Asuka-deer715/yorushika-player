import {t,formatText} from '../localization/i18n.js';
import type {Release} from './catalog-data.js';
const descriptions:Record<string,string>={
 'band-雲を抜け風下へ私だけ':'ヨルシカ于 2026 年发行的数字单曲，也是电视动画《药屋少女的呢喃》第三季第一季度的片头曲。',
 '18':'以“春”为主题的五首作品，收录《春泥棒》《嘘月》与《強盗と花束》。',
 '15':'以一位盗用音乐的男子为主人公的概念专辑；初回限定版还包含描写其经历的小说。',
};
const names={band:'ヨルシカ',nbuna:'n-buna',suis:'suis','collab-n':'n-buna 参与的合作作品','collab-s':'suis 参与的合作作品'};
export function describeRelease(release:Release){return descriptions[release.id]?t(descriptions[release.id]):formatText("{1}的作品。当前目录列出 {2} 首曲目，可在下方查看本地收藏与相关视频。",t(names[release.category]),release.tracks.length);}
