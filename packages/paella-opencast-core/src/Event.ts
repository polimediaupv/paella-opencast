/**
 * OpenCast Event Interface
 * 
 * In Opencast, event information can be obtained from two different sources:
 * 1. The Engage Service
 * 2. The External API
 * 
 * The response structure from these two services differs significantly.
 * This interface provides a simplified and standardized data model that Paella Player uses to work with Opencast events.
 * It serves as an intermediate representation that doesn't match exactly either of the source formats,
 * but contains all the essential information needed for video playback and event management within Paella Player.
 * 
 * The Event interface normalizes metadata, media tracks, attachments, and access control information
 * to make integration between Paella Player and Opencast more straightforward.
 */

export interface Event {
    id:            string
    org?:          string;
    acl?:          ACL[]
    metadata?:     Metadata;
    tracks?:       Track[]
    attachments?:  Attachment[]
    catalogs?:     Catalog[];
    segments?:     Segment[]
}

export interface ACL {
    action: string
    allow: boolean
    role: string
}

export type Metadata = Partial<{
    title: string
    subject: string
    description: string
    language: string
    rightsHolder: string
    license: string
    series: string
    seriesTitle: string
    // creator: string
    presenters: string[]
    contributors: string[]
    startDate: Date
    duration: number
    location: string
    source: string
    created: Date
    publisher: string
    id: string
}>



export interface MediaPackageElement {
    id: string
    url: string
    mimetype: string
    flavor: string
    tags?: string[]
    ref?: string
    checksum?: MediaPackageElementChecksum
    size?: number
}

export interface MediaPackageElementChecksum {
    type:  string;
    value: string;
}

export interface Track extends MediaPackageElement {
    is_master?: boolean
    is_live?: boolean
    duration?: number
    audio?:    Audio;
    video?:    Video;
    subtitle?: Subtitle;
}

export type Audio = Partial<{
    id:           string;
    device:       string;
    encoder:      Encoder;
    framecount:   number;
    channels:     number;
    samplingrate: number;
    bitrate:      number;
}>

export type Video = Partial<{
    id:         string;
    device:     string;
    encoder:    Encoder;
    framecount: number;
    bitrate:    number;
    framerate:  number;
    width:      number
    height:     number
}>

export type Subtitle = Partial<{
    id:        string;
    device:    string;
    encoder:   Encoder;
}>

export interface Encoder {
    type: string;
}

export interface Attachment extends MediaPackageElement {
    additionalProperties?: Record<string, string>
}

export interface Catalog extends MediaPackageElement {    
}

export interface Segment {
    index: number
    time: number
    duration: number
    text: string
    preview: string
}
