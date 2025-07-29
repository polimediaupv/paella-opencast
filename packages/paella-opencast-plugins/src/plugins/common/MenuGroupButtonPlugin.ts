import { ButtonGroupPlugin, ButtonPlugin, Paella, type MenuItem, type PluginConfig } from '@asicupv/paella-core';
import DownloadIcon from '../icons/download.svg?raw';

type MenuGroupData = {
    url?: string;
    items?: MenuGroupItem[];
}

export type MenuGroupItem = MenuItem<MenuGroupData>;

class LinkMenuGroupButtonPlugin extends ButtonPlugin {
    private _downloadableContent?: MenuGroupItem;    

    private set internlConfig(config: PluginConfig) {
        (this as any)._config = config;
    }

    constructor(player: Paella, name: string, config: PluginConfig = {}, downloadableContent?: MenuGroupItem ) {
        super(player, name);        
        this.internlConfig = config;
        this._downloadableContent = downloadableContent;        
    }    

    get stateIcon() {
		return DownloadIcon;
	}

    async getAnchorUrl(): Promise<string | null> {
        const url: string | null = this._downloadableContent?.data?.url || null;
        return url;
    }

    get isAnchor(): boolean {
        return true;
    }

    get anchorTarget(): string | null {
        return '_blank';
    }
    get anchorDownloadFilename(): string | null {
        const url: string | null = this._downloadableContent?.data?.url || null;
        if (!url) return null;

        const filename = url.split('/').pop();
        return filename || null;
    }
    //get anchorReferrerPolicy(): string | null;
}


export default class MenuGroupButtonPlugin extends ButtonGroupPlugin {
    private _items: MenuGroupItem[] = [];

    private set internlConfig(config: PluginConfig) {
        (this as any)._config = config;
    }

    constructor(player: Paella, name?: string, config: PluginConfig = { }, items: MenuGroupItem[] = []) {
        super(player, name);
        (this as any)._buttonPlugins = [];        
        this.internlConfig = config;

        this.items = items || [];
    }

    get items() {
        return this._items;
    }

    set items(items: MenuGroupItem[]) {
        this._items = items;

        this.items.forEach((item) => {
            if (item.data?.items && item.data.items.length > 0) {
                const groupConfig = { enabled: true, side: this.config.side, description: item.title };
                const group = new MenuGroupButtonPlugin(this.player, `${item.id}`, groupConfig, item.data.items);
                (this as any)._buttonPlugins.push(group);
            }
            else {
                const plugConfig = { enabled: true, side: this.config.side, description: item.title };
                const plug = new LinkMenuGroupButtonPlugin(this.player, `${item.id}`, plugConfig, item);
                (this as any)._buttonPlugins.push(plug);
            }
        });
    }    
}
