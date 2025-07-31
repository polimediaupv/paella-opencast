---
title: Event converters
description: Converters to transform Opencast events to Paella Player format
---

Event converters are components that transform Opencast event data from different sources to the normalized `Event` format used by Paella Player.

## EventConversor (Base class)

The base `EventConversor` class provides common functionalities for event conversion.

```typescript
export class EventConversor {
    readonly paella: Paella;
    readonly conversionConfig: ConversionConfig;

    constructor(paella: Paella, conversionConfig: ConversionConfig = {})
}
```

### ConversionConfig

Configuration to customize the conversion process:

```typescript
export interface ConversionConfig {
    captionsBackwardsCompatibility?: boolean
    segmentPreviewAttachmentsFlavours?: string[]
    playerPreviewAttachmentsFlavours?: string[]
    timelineAttachmentsFlavours?: string[]
    tagFor360Video?: string
    hideTimeLineOnLive?: boolean
}
```

#### Configuration properties

- **captionsBackwardsCompatibility**: Enables compatibility with legacy captions
- **segmentPreviewAttachmentsFlavours**: Attachment types for segment previews
- **playerPreviewAttachmentsFlavours**: Attachment types for player previews  
- **timelineAttachmentsFlavours**: Attachment types for timeline
- **tagFor360Video**: Tag to identify 360° videos
- **hideTimeLineOnLive**: Hide timeline on live broadcasts

## EngageEventConversor

Converts events from Opencast's Engage service to `Event` format.

```typescript
export function opencastSearchResultToOpencastPaellaEvent(searchResult: any): Event
export function opencastSearchResultToPaellaManifest(searchResult: any, paella: Paella, conversionConfig: ConversionConfig = {}): Promise<Manifest>
```

### Main functions

#### opencastSearchResultToOpencastPaellaEvent

Converts an Engage service search result to an `Event` object.

**Parameters:**
- `searchResult`: Search result from Engage service

**Returns:** Normalized `Event` object

#### opencastSearchResultToPaellaManifest

Converts an Engage service search result to a Paella Player manifest.

**Parameters:**
- `searchResult`: Search result from Engage service
- `paella`: Paella Player instance
- `conversionConfig`: Conversion configuration

**Returns:** Promise that resolves to a Paella `Manifest`



## APIEventConversor

Converts events from Opencast's external API to `Event` format.

```typescript
export function opencastExternalAPIEventToPaellaManifest(event: any, paella: Paella, conversionConfig: ConversionConfig = {}): Promise<Manifest>
```

### opencastExternalAPIEventToPaellaManifest

Converts an external API event to a Paella Player manifest.

**Parameters:**
- `event`: Event from Opencast external API
- `paella`: Paella Player instance
- `conversionConfig`: Conversion configuration

**Returns:** Promise that resolves to a `Manifest`




## See also

- [Event](/paella-opencast/reference/paella-opencast-core/event)
- [OpencastPaellaPlayer](/paella-opencast/reference/paella-opencast-core/opencast-paella-player)
- [OpencastInitParams](/paella-opencast/reference/paella-opencast-core/opencast-init-params)
