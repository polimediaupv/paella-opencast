import { DataPlugin, type DataPluginConfig } from '@asicupv/paella-core';
import { OpencastPaellaPlayer, type Event } from '@asicupv/paella-opencast-core';
import type { RelatedDocument, RelatedDocuments } from '@asicupv/paella-extra-plugins';
import OpencastPaellaPluginsModule from './OpencastPaellaPluginsModule';



export type OpencastRelatedDocumentsDataPluginConfig = DataPluginConfig & {
    docs?: {
      title: string;
      content?: {
          flavor: string;
          mimeType?: string;
      },
      media?: {
          flavor: string;
          mimeType?: string;
      }
    }[];
};

export default class OpencastRelatedDocumentsDataPlugin extends DataPlugin<OpencastRelatedDocumentsDataPluginConfig, RelatedDocuments> {
  getPluginModuleInstance() {
    return OpencastPaellaPluginsModule.Get();
  }

  async isEnabled() {
    const isOcPlayer = this.player instanceof OpencastPaellaPlayer;
    if (!isOcPlayer) {
      this.player.log.warn(`${this.name} is only available in Opencast Paella Player`, `${this.getPluginModuleInstance().moduleName} [${this.name}]`);
      return false;
    }

    return await super.isEnabled();
  }

  get name() {
    return super.name || 'org.opencast.paella.data.relatedDocumentsDataPlugin';
  }

  get context() { return this.config.context ?? ['file.content'] }

  async read(_context:string, _key: string): Promise<RelatedDocuments> {
    const ocPlayer = this.player as OpencastPaellaPlayer;
    const ocEvent = await ocPlayer.metadata.ocEvent as Event;    
    const attachments = ocEvent?.attachments || [];
    const tracks = ocEvent?.tracks || []

    if (!this.config.docs) {
      this.player.log.error("Plugin not configured correctly: No files section configured", `${this.getPluginModuleInstance().moduleName} [${this.name}]`);
    }
    // else if (!(key in this.config.files)) {
    //   this.player.log.error(`Plugin not configured correctly: Property 'files' not configured in plugin`, `${this.getPluginModuleInstance().moduleName} [${this.name}]`);
    // }
    else {      
      const files = this.config.docs ?? [];
      const filesData = await Promise.all(
        files.map(async (fileInfo) => {
          const f_att = attachments.find(a => a.flavor == fileInfo.content?.flavor);
          const f_track = tracks.find(t => t.flavor == fileInfo.media?.flavor);

          const ret: RelatedDocument = {
            title: fileInfo.title,
          };
          
          if (f_att) {
            // If the attachment is already in the mediapackage, we can use it
            const url = f_att.url;
            // Read the file content
            const content = await fetch(url)
              .then(async (response) => {
                if (!response.ok) {
                  return null;
                }
                else {
                  return await response.text();
                }
              });
            if (content != null) {
              ret.content = {
                data: content,
                mimeType: fileInfo.content?.mimeType ?? f_att.mimetype
              };
            }
          }
          if (f_track) {
            // If the track is already in the mediapackage, we can use it
            ret.media = {
              url: f_track.url,
              mimeType: fileInfo.media?.mimeType ?? f_track.mimetype
            };
          }          

          return ret;
        })        
      );

      return filesData.filter(file => file.content || file.media);
    }
    return [];
  }
}
