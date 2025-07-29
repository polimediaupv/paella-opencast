
import { type Attachment, type Catalog, type Event, type MediaPackageElementChecksum, type Metadata, type Track } from '../Event';
import { EventConversor, type ConversionConfig } from '../EventConversor/EventConversor';
import { Paella, type Manifest } from '@asicupv/paella-core';


export function parseChecksum(input?: string): MediaPackageElementChecksum | undefined {
    const match = input?.match(/^([a-fA-F0-9]+) \(([^)]+)\)$/);    
    if ((match != null) && (match.length != undefined) && (match.length >= 3)) {
        const [, value, type] = match;
        return { type, value };
    }

    return;
}

export function opencastExternalAPIEventToOpencastPaellaEvent(externalEvent: any): Event {
    if (!externalEvent) {
        throw new Error('Invalid external event data');
    }
    
    const metadata: Metadata = {
        title: externalEvent?.title,
        subject: externalEvent?.subjects?.[0],
        description: externalEvent?.description,
        language: externalEvent?.language,
        rightsHolder: externalEvent?.rightsholder,
        license: externalEvent?.license,
        series: externalEvent?.is_part_of,
        seriesTitle: externalEvent?.series,
        // creator: externalEvent?.creator,
        presenters: externalEvent?.presenter,
        contributors: externalEvent?.contributor,
        startDate: new Date(externalEvent?.start as string),
        duration: externalEvent?.duration ?? 0,
        location: externalEvent?.location,
        source: externalEvent?.source,
        created: new Date(externalEvent?.created as string),
        publisher: "TODO: publisher",
        id: externalEvent?.identifier
    };

    // const acl = externalEvent?.acl?.map((acl: any) => {
    //     const a:  Manifest['acl']= {
    //         allow: acl.allow,
    //         role: acl.role,
    //         action: acl.action
    //     }
    //     return a;
    // });

    const publication = externalEvent?.publications?.filter((x: any) => x?.channel === 'engage-player')?.[0];

    const tracks: Track[] = publication?.media?.map((track: any) => {
        const t: Track = {
            id: track?.id,
            url: track?.url,
            mimetype: track?.mediatype,
            flavor: track?.flavor,
            tags: track?.tags,
            ref: track?.ref,
            checksum: parseChecksum(track?.checksum),
            size: track?.size,
            is_master: track?.is_master_playlist,
            is_live: track?.is_live,
            duration: (track?.duration ?? 0) / 1000,
            audio: track?.has_audio && {
                // id: track.audio?.id,
                // device: track.audio?.device,
                // encoder: track.audio?.encoder,
                // framecount: track.audio?.framecount,
                // channels: track.audio?.channels,
                // samplingrate: track.audio?.samplingrate,
                // bitrate: track.audio?.bitrate
            },
            video: track.has_video && {
                // id: track.video.id,
                // device: track.video.device,
                // encoder: track.video.encoder,
                framecount: track.framecount,
                bitrate: track.bitrate,
                framerate: track.framerate,
                width: track.width,
                height: track.height
            }
        };
        return t;
    });

    const attachments: Attachment[] = publication?.attachments?.map((attachment: any) => {
        const a: Attachment = {
            id: attachment?.id,
            url: attachment?.url,
            mimetype: attachment?.mediatype,
            flavor: attachment?.flavor,
            tags: attachment?.tags,
            ref: attachment?.ref,
            checksum: parseChecksum(attachment?.checksum),
            size: attachment?.size
        };
        return a;
    });

    const catalogs: Catalog[] = publication?.metadata?.map((catalog: any) => {
        const c: Catalog = {
            id: catalog?.id,
            url: catalog?.url,
            mimetype: catalog?.mediatype,
            flavor: catalog?.flavor,
            tags: catalog?.tags,
            ref: catalog?.ref,
            checksum: parseChecksum(catalog?.checksum),
            size: catalog?.size < 0 ? undefined : catalog?.size
        };
        return c;
    });

    const event: Event = {
        id: externalEvent?.identifier,
        // org,
        // acl,
        metadata,
        tracks,
        attachments,
        catalogs
        // segments
    };

    return event;

}

export function opencastExternalAPIEventToPaellaManifest(paella: Paella, externalEvent: any, config: ConversionConfig = {}): Manifest {
    const event: Event = opencastExternalAPIEventToOpencastPaellaEvent(externalEvent);
    const conversor = new EventConversor(paella, config);
    return conversor.commonEventToPaellaManifest(event);
}