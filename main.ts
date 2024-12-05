import { Notice, Plugin } from 'obsidian';
import SettingTab from 'src/settings';
import { VikaLinkDelete } from 'src/VikaLinkDelete';
export interface VikaOriginSetting {
    token: string;
    datasheetId: string;
    viewId: string;
}
export interface PluginSettings {
    origin: string;
    vika: VikaOriginSetting;
}
const DEFAULT_SETTINGS: PluginSettings = {
    origin: 'vika',
    vika: {
        token: '',
        datasheetId: '',
        viewId: '',
    },
};
export default class RemoteImageDeletePlugin extends Plugin {
    settings: PluginSettings;
    async loadSettings() {
        this.settings = Object.assign(DEFAULT_SETTINGS, await this.loadData());
		console.log(this.settings);
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new SettingTab(this.app, this));

        this.addRibbonIcon('dice', '清理存储库图片', () => {
            // 获取知识库下的所有文件列表
            const files = this.app.vault.getMarkdownFiles();
            // 遍历知识库下的所有文件
            const links: string[] = [];

            (async () => {
                for (const file of files) {
                    const content = await this.app.vault.read(file);
                    // 读取内容中包含 ![xxx]()形式的文件
                    const matchs = content.match(/\!\[.*\]\((.*)\)/g);
                    if (matchs) {
                        // 遍历匹配到的文件
                        for (const match of matchs) {
                            // 从 ![xxx](link)形式的文件 中提取到link
                            const link = match.slice(
                                match.indexOf('(') + 1,
                                match.lastIndexOf(')'),
                            );
                            if (link.includes('s1.vika.cn')) {
                                links.push(link);
                            }
                        }
                    }
                }
                // 将links中的重复数据提出
                const uniqueLinks = links.filter(
                    (link, index) => links.indexOf(link) === index,
                );
                new Notice('本地共发现' + uniqueLinks.length + '个链接');
                new VikaLinkDelete(uniqueLinks,this.settings).delete();
            })();
        });
    }

    onunload() {}
}
