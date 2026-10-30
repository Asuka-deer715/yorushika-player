// 界面适配器仅使用业务 API，不访问磁盘或数据库。
class LibraryClient {
  constructor(api, onChange, escape) {
    this.api = api;
    this.onChange = onChange;
    this.escape = escape;
    this.items = [];
    this.message = '';
  }
  update(items) { this.items = items; this.onChange(items); }
  async load() {
    try { this.update(await this.api.list()); }
    catch (error) { this.report(error.message); }
  }
  report(message) {
    this.message = message;
    this.onChange(this.items);
    document.querySelector('#nowSubtitle').textContent = message;
  }
  async importFiles(kind) {
    try {
      const result = await this.api.importFiles(kind);
      this.message = result.failures.map(f => `${f.name}：${f.message}`).join('；');
      this.update(result.items);
      if (this.message) this.report(this.message);
    } catch (error) { this.report(error.message); }
  }
  render() {
    return `<section class="section"><h2>导入与整理</h2><p>只记录文件位置，不复制或移动原文件。重复导入同一路径不会新增记录。</p><p><button class="upload-button" data-open="audio">导入音频</button> <button class="upload-button" data-open="mv">导入视频</button> <button class="upload-button" data-refresh-library>检查文件</button></p><p role="status">${this.escape(this.message)}</p>${this.items.map(item => `<div class="setting-row"><span>${this.escape(item.name)}<small>${item.kind === 'audio' ? '音频' : '视频'} · ${item.missing ? '文件不可读，请重新关联' : '已保存'}</small></span><button class="upload-button" data-relink="${item.id}">重新关联</button></div>`).join('')}</section>`;
  }
  bind() {
    document.querySelectorAll('[data-refresh-library]').forEach(button => button.onclick = () => this.load());
    document.querySelectorAll('[data-relink]').forEach(button => button.onclick = async () => {
      try { this.update(await this.api.relink(button.dataset.relink)); }
      catch (error) { this.report(error.message); }
    });
  }
}
