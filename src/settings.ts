// obsidian 插件的settings页

import RemoteImageDeletePlugin from 'main';
import { App, PluginSettingTab, Setting } from 'obsidian';

// 添加插件配置
export default class SettingTab extends PluginSettingTab {
    plugin: RemoteImageDeletePlugin;
    constructor(app: App, plugin: RemoteImageDeletePlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        let { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'My Custom Plugin Settings' });
        new Setting(containerEl)
            .setName('选择图床')
            .setDesc('选择远程文件存储的图床类型')
            .addDropdown((cb) => {
                cb.addOption('vika', 'vika')
                    .addOption('xxxx', 'xxxx')
                    .setValue(this.plugin.settings.origin)
                    .onChange(async (value) => {
                        this.plugin.settings.origin = value;
                        this.display();
                        await this.plugin.saveSettings();
                    });
            });
        if (this.plugin.settings.origin === 'vika') {
            const vikaSettings = [
                { name: 'token', desc: 'vika的token地址', placeholder: '请输入vika的token地址', key: 'token' },
                { name: 'datasheetId', desc: 'vika的datasheetId', placeholder: '请输入vika的datasheetId', key: 'datasheetId' },
                { name: 'viewId', desc: 'vika的datasheet下的ViewId', placeholder: '请输入vika的datasheet下的ViewId', key: 'viewId' }
            ];

            vikaSettings.forEach(setting => {
                new Setting(containerEl)
                    .setName(setting.name)
                    .setDesc(setting.desc)
                    .addText((text) =>
                        text
                            .setPlaceholder(setting.placeholder)
                            // @ts-ignore
                            .setValue(this.plugin.settings.vika[setting.key])
                            .onChange(async (value) => {
                                // @ts-ignore
                                this.plugin.settings.vika[setting.key] = value;
                                await this.plugin.saveSettings();
                            }),
                    );
            });
        }
    }
}
