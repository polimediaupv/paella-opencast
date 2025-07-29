import { type ButtonPluginConfig, type VideoLayoutConfig } from '@asicupv/paella-core';
import OpencastDownloadsPlugin, { type OpencastDownloadsPluginConfig } from './plugins/org.opencast.paella.downloadsPlugin';
import OpencastEditorPlugin, { type OpencastEditorPluginConfig } from './plugins/org.opencast.paella.editorPlugin';
import OpencastEventDetailsPlugin from './plugins/org.opencast.paella.eventDetailsPlugin';
import OpencastLoginPlugin from './plugins/org.opencast.paella.loginPlugin';
import OpencastMultiVideoDynamicLayout from './plugins/org.opencast.paella.multiVideoDynamicLayout';
import OpencastMatomoUserTrackingDataPlugin, { type OpencastMatomoUserTrackingDataPluginConfig } from './plugins/org.opencast.paella.matomo.userTrackingDataPlugin';
import OpencastRelatedVideosDataPlugin, { type OpencastRelatedVideosDataPluginConfig } from './plugins/org.opencast.paella.data.relatedVideosDataPlugin';
import OpencastRelatedDocumentsDataPlugin, { type OpencastRelatedDocumentsDataPluginConfig } from './plugins/org.opencast.paella.data.relatedDocumentsDataPlugin';


export const opencastPlugins = [
    {
        plugin: OpencastDownloadsPlugin,
        config: {
            enabled: false,
            side: "right",
            tracks: {
                downloadFlavors: [],
                downloadTags: [],
                downloadMimeTypes: ["audio/m4a", "video/mp4", "text/vtt"]
            },
            attachments: {
                downloadFlavors: [],
                downloadTags: [],
                downloadMimeTypes: []
            },
            enableOnLicenses: [
                "CC-BY",
                "CC-BY-SA",
                "CC-BY-ND",
                "CC-BY-NC",
                "CC-BY-NC-SA",
                "CC-BY-NC-ND",
                "CC0"
            ],
            enableOnWritePermission: true
        } satisfies OpencastDownloadsPluginConfig
    },
    {
        plugin: OpencastEditorPlugin,
        config: {
            enabled: false,
            side: "right",
            showIfAnonymous: false,
            showIfCanWrite: true,
            editorUrl: "/editor-ui/index.html?id={id}"
        } satisfies OpencastEditorPluginConfig
    },
    {
        plugin: OpencastEventDetailsPlugin,
        config: {
            enabled: false,
            side: "right"
        } satisfies ButtonPluginConfig
    },    
    {
        plugin: OpencastLoginPlugin,
        config: {
            enabled: false,
            side: "right"
        } satisfies ButtonPluginConfig
    },
    {
        plugin: OpencastMultiVideoDynamicLayout,
        config: {
            enabled: false
        } satisfies VideoLayoutConfig
    },
    {
        plugin: OpencastMatomoUserTrackingDataPlugin,
        config: {
            enabled: false,
            logUserId: true
        } satisfies OpencastMatomoUserTrackingDataPluginConfig
    },
    {
        plugin: OpencastRelatedVideosDataPlugin,
        config: {
            enabled: true,
            maxCount: 100,
            playerPreviewAttachmentsFlavours: [
                'presenter/player+preview',
                'presentation/player+preview'
            ]
        } satisfies OpencastRelatedVideosDataPluginConfig
    },
    {
        plugin: OpencastRelatedDocumentsDataPlugin,
        config: {
            enabled: true,
            docs: [
                {
                    title: "Summary",
                    content: { flavor: 'ai/summary', mimeType: 'text/markdown' }                    
                },
                {
                    title: "FAQ",
                    content: { flavor: 'ai/faq', mimeType: 'text/markdown' }
                }
            ]
        } satisfies OpencastRelatedDocumentsDataPluginConfig
    }
];

export {
    OpencastDownloadsPlugin, type OpencastDownloadsPluginConfig,
    OpencastEditorPlugin, type OpencastEditorPluginConfig,
    OpencastEventDetailsPlugin,
    OpencastLoginPlugin,
    OpencastMultiVideoDynamicLayout,
    OpencastMatomoUserTrackingDataPlugin, type OpencastMatomoUserTrackingDataPluginConfig,
    OpencastRelatedVideosDataPlugin, type OpencastRelatedVideosDataPluginConfig,
    OpencastRelatedDocumentsDataPlugin, type OpencastRelatedDocumentsDataPluginConfig
};
