import {t} from '../localization/i18n.js';

export function mountStoryDetails(actions: HTMLElement, key: string, title: string, label: string, summary: string) {
 void window.storySources.details().then(contents => {
  if (!contents || !actions.isConnected) return;
  const button = document.createElement('button');
  button.className = 'quiet';
  button.textContent = t('查看详情');
  button.onclick = () => showStoryDetails(actions, title, label, summary, contents[key], button);
  actions.append(button);
 }).catch(error => console.error('读取本地故事详情失败', error));
}

function showStoryDetails(origin: HTMLElement, title: string, label: string, summary: string, content: string | undefined, trigger: HTMLButtonElement) {
 const host = origin.closest<HTMLElement>('#story-page');
 if (!host) return;
 const main = host.closest<HTMLElement>('main');
 const scroll = main?.scrollTop ?? 0;
 const previous = Array.from(host.children) as HTMLElement[];
 previous.forEach(child => child.hidden = true);

 const page = document.createElement('section');
 page.className = 'story-detail-page';
 const back = document.createElement('button');
 back.className = 'quiet story-detail-back';
 back.textContent = '← ' + t('返回故事时间线');
 const header = document.createElement('header');
 header.className = 'story-detail-header';
 const chapter = document.createElement('p');
 chapter.className = 'story-detail-label';
 chapter.textContent = label;
 const heading = document.createElement('h1');
 heading.textContent = title;
 const introduction = document.createElement('p');
 introduction.className = 'story-detail-intro';
 introduction.textContent = summary;
 header.append(chapter, heading, introduction);

 const material = document.createElement('section');
 material.className = 'story-detail-material';
 const materialHeading = document.createElement('h2');
 materialHeading.textContent = t('特典内容');
 const body = document.createElement('div');
 body.className = content ? 'story-detail-content' : 'story-detail-placeholder';
 const bodyText = document.createElement('p');
 bodyText.textContent = content || t('此处将展示你提供的特典材料。');
 body.append(bodyText);
 material.append(materialHeading, body);
 page.append(back, header, material);
 back.onclick = () => {
  page.remove();
  previous.forEach(child => child.hidden = false);
  if (main) main.scrollTop = scroll;
  trigger.focus();
 };
 host.append(page);
 if (main) main.scrollTop = 0;
 back.focus();
}
