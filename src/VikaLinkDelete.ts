import { Notice } from 'obsidian';
import { LinkDelete } from './interface'; // adjust the path as needed
import { IRecord, Vika } from '@vikadata/vika';
import { Datasheet } from '@vikadata/vika/es/datasheet';
import { chunk } from './utils/common-util';
import { PluginSettings, VikaOriginSetting } from 'main';
interface LinkFile {
    url: string;
    recordId: string;
}
class VikaLinkDelete implements LinkDelete {
    links: string[];
    settings: VikaOriginSetting;
    datasheet: Datasheet;
    constructor(links: string[],settings: PluginSettings) {
        this.links = links;
        this.settings = settings.vika;
        this.datasheet = new Vika({ token: this.settings.token}).datasheet(this.settings.datasheetId);
    }

    async delete(): Promise<void> {
        const needDeleteRecordId = await this.getAllNeedDeleteRecordId();
        if(needDeleteRecordId.length === 0) {
            new Notice("当前数据一致,无需删除");
            return;
        }
        new Notice('共需要移除' + needDeleteRecordId.length + '个未使用链接');
        // needDeleteRecordId每十条分组
        const needDeleteRecordchunks = chunk(needDeleteRecordId, 10);
        (async () => {
            for (const chunkOne of needDeleteRecordchunks) {
                // 移除
                const resp = await this.datasheet.records.delete(chunkOne);
                if (!resp.success) {
                    new Notice('删除失败');
                    console.log(resp);
                }
                // 停顿0.5s
                await new Promise((resolve) => setTimeout(resolve, 500));
            }
            new Notice('删除成功');
        })();
    }
    private async getAllNeedDeleteRecordId() {
        const records = await this.getAllRecords();
        new Notice('远程共有' + records.length + '条记录');
        const needDeleteRecordId: string[] = [];
        const linkFiles: LinkFile[] = this.format2LinkFiles(records);

        // 对linkFiles中根据url分组,并将recordId放入值数组
        const linkFilesGroup = linkFiles.reduce((acc, cur) => {
            if (!acc[cur.url]) {
                acc[cur.url] = [];
            }
            acc[cur.url].push(cur.recordId);
            return acc;
        }, {} as Record<string, string[]>);
        // 获取linkFiles中的key
        const linkFilesKeys = Object.keys(linkFilesGroup);

        // 计算needDeleteRecordId
        for (const linkFileKey of linkFilesKeys) {
            if (!this.links.includes(linkFileKey)) {
                needDeleteRecordId.push(...linkFilesGroup[linkFileKey]);
            } else {
                // 计算被使用了,但是由多个recordId的
                if (linkFilesGroup[linkFileKey].length > 1) {
                    // linkFilesGroup[linkFileKey]移除第一个recordId
                    linkFilesGroup[linkFileKey].shift();
                    needDeleteRecordId.push(...linkFilesGroup[linkFileKey]);
                }
            }
        }
        return needDeleteRecordId;
    }

    /**
     *
     * @param records 将记录格式化为简单的LinkFile便于后续处理
     * @returns
     */
    private format2LinkFiles(records: IRecord[]) {
        const linkFiles: LinkFile[] = [];
        for (const record of records) {
            const attachment = record.fields['附件'];
            if (
                attachment &&
                Array.isArray(attachment) &&
                attachment.length > 0
                && attachment[0]
            ) {
                const url = (attachment[0] as { url: string }).url;
                linkFiles.push({ url, recordId: record.recordId });
            }
        }
        return linkFiles;
    }

    async getAllRecords() {
        // 自动处理分页，迭代返回所有记录。
        const recordsIter = this.datasheet.records.queryAll({
            viewId: this.settings.viewId,
        });
        const allRecords: IRecord[] = [];

        // for await 需要运行在 async 函数中，对浏览器/node 版本有要求。具体参考 https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/for-await...of
        for await (const eachPageRecords of recordsIter) {
            allRecords.push(...eachPageRecords);
        }
        return allRecords;
    }
}
export { VikaLinkDelete };
