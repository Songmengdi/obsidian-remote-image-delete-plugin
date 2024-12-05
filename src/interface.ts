interface LinkDelete {
    links: string[];
    /**
     * 保留links,移除其他的存储信息;
     */
    delete(): void;
}
export type {LinkDelete}