
import { type ACL, type Attachment, type Catalog, type Event, type MediaPackageElementChecksum, type Metadata, type Track } from '../Event';
import { EventConversor, type ConversionConfig } from '../EventConversor/EventConversor';
import { Paella, type Manifest } from '@asicupv/paella-core';
import { ensureArray, ensureSingle } from '../utils';

const getChecksum = (checksum: any): MediaPackageElementChecksum => {
    const c : MediaPackageElementChecksum = {
        type: checksum?.type,
        value: checksum?.$
    }

    return c;
}

export function opencastSearchResultToOpencastPaellaEvent(searchResult: any): Event {
    const metadata: Metadata = {
        title: searchResult?.mediapackage?.title,
        subject: searchResult?.mediapackage?.subjects?.subject ?? ensureSingle(searchResult?.dc?.subject),
        description: ensureSingle(searchResult?.dc?.description) ?? searchResult?.dcDescription,
        language: searchResult?.mediapackage?.language ?? ensureSingle(searchResult?.dc?.language),
        rightsHolder: ensureSingle(searchResult?.dc?.rightsholder) ?? searchResult?.dcRightsHolder,
        license: searchResult?.mediapackage?.license ?? ensureSingle(searchResult?.dc?.license),
        series: ensureSingle(searchResult?.dc?.isPartOf) ?? searchResult?.dcIsPartOf,
        seriesTitle: searchResult?.mediapackage?.seriestitle,  //TODO ************************************************
        // creator: "TODO: Creator" ?? serachResult?.dcCreator,
        presenters: ensureArray(searchResult?.mediapackage?.creators?.creator),
        contributors: ensureArray(searchResult?.mediapackage?.contributors?.contributor),
        startDate: new Date(searchResult?.mediapackage?.start as string),
        duration: (searchResult?.mediapackage?.duration ?? 0) / 1000,
        location: ensureSingle(searchResult?.dc?.spatial) ?? searchResult?.dcSpatial,
        source: ensureSingle(searchResult?.dc?.source), //TODO ************************************************
        created: new Date(ensureSingle(searchResult?.dc?.created) ?? searchResult?.dcCreated),
        publisher: ensureSingle(searchResult?.dc?.publisher) ?? searchResult?.dcPublisher,
        id: searchResult?.mediapackage?.id ?? searchResult?.id
    };

    const tracks: Track[] = ensureArray(searchResult?.mediapackage?.media?.track).map((track) => {
        const resolution = track.video?.resolution as string || '1x1';
        const resData = /(\d+)x(\d+)/.exec(resolution);

        
        const t: Track = {
            id: track?.id,
            url: track?.url,
            mimetype: track?.mimetype,
            flavor: track?.type,
            tags: ensureArray(track?.tags.tag),
            ref: track?.ref,
            checksum: track?.checksum && getChecksum(track.checksum),
            size: track?.size,
            is_master: track?.master,
            is_live: track?.live,
            duration: (track?.duration ?? 0) / 1000,
            audio: track?.audio && {
                id: track.audio?.id,
                device: track.audio?.device,
                encoder: track.audio?.encoder,
                framecount: track.audio?.framecount,
                channels: track.audio?.channels,
                samplingrate: track.audio?.samplingrate,
                bitrate: track.audio?.bitrate
            },
            video: track.video && {
                id: track.video.id,
                device: track.video.device,
                encoder: track.video.encoder,
                framecount: track.video.framecount,
                bitrate: track.video.bitrate,
                framerate: track.video.framerate,
                width: resData ? parseInt(resData[1]) : 0,
                height: resData ? parseInt(resData[2]) : 0
            }
        };
        return t;
    });

    const attachments: Attachment[] = ensureArray(searchResult?.mediapackage?.attachments.attachment).map((attachment: any) => {        
        const props = attachment?.additionalProperties?.property?.reduce((acc: any, prop: any) => {
            acc[prop.key] = prop.$;
            return acc;
        }, {});
        
        const a: Attachment = {
            id: attachment?.id,
            url: attachment?.url,
            mimetype: attachment?.mimetype,
            flavor: attachment?.type,
            tags: ensureArray(attachment?.tags?.tag),
            ref: attachment?.ref,
            checksum: attachment?.checksum && getChecksum(attachment.checksum),
            size: attachment?.size,
            additionalProperties: props
        };
        return a;
    });

    const catalogs: Catalog[] = ensureArray(searchResult?.mediapackage?.metadata?.catalog).map((catalog: any) => {
        const c: Catalog = {
            id: catalog?.id,
            url: catalog?.url,
            mimetype: catalog?.mimetype,
            flavor: catalog?.type,
            tags: ensureArray(catalog?.tags?.tag),
            ref: catalog?.ref,
            checksum: catalog?.checksum && getChecksum(catalog.checksum),
            size: catalog?.size
        };
        return c;
    });

    const acl = ensureArray(searchResult?.acl).map((ace: any) => {
        const n_ace: ACL = {
            action: ace?.action,
            role: ace?.role,
            allow: ace?.allow
        }
        return n_ace;
    });

    const event: Event = {
        id: searchResult?.mediapackage?.id,
        org: searchResult?.org,
        acl,
        metadata,        
        tracks,
        attachments,
        catalogs
        // segments
    };

    return event;
}

export async function opencastSearchResultToPaellaManifest(paella: Paella, searchResult: any, config: ConversionConfig = {}): Promise<Manifest> {
    const event: Event = opencastSearchResultToOpencastPaellaEvent(searchResult);
    const conversor = new EventConversor(paella, config);
    return await conversor.commonEventToPaellaManifest(event);
}
