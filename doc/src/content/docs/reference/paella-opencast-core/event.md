---
title: Event
description: Interface for Opencast events
---

The `Event` interface defines the normalized structure of Opencast events used by Paella Player. This interface serves as an intermediate data model that doesn't exactly match any of the source formats (Engage Service or External API), but contains all the essential information needed for video playback and event management.

## Event Interface

```typescript
export interface Event {
    id: string
    org?: string;
    acl?: ACL[]
    metadata?: Metadata;
    tracks?: Track[]
    attachments?: Attachment[]
    catalogs?: Catalog[];
    segments?: Segment[]
}
```

### Properties

#### id

```typescript
id: string
```

Unique identifier of the event.

#### org

```typescript
org?: string
```

Organization to which the event belongs.

#### acl

```typescript
acl?: ACL[]
```

Access Control List of the event.

#### metadata

```typescript
metadata?: Metadata
```

Event metadata (title, description, presenters, etc.).

#### tracks

```typescript
tracks?: Track[]
```

Media tracks of the event (video, audio).

#### attachments

```typescript
attachments?: Attachment[]
```

Files attached to the event.

#### catalogs

```typescript
catalogs?: Catalog[]
```

Catalogs associated with the event.

#### segments

```typescript
segments?: Segment[]
```

Event segments (for temporal navigation).

## ACL (Access Control List)

```typescript
export interface ACL {
    action: string
    allow: boolean
    role: string
}
```

Defines access permissions for different roles.

### Properties

- **action**: Action being controlled (e.g., "read", "write")
- **allow**: Whether the action is allowed (`true`) or denied (`false`)
- **role**: Role to which the rule applies

## Metadata

```typescript
export type Metadata = Partial<{
    title: string
    subject: string
    description: string
    language: string
    rightsHolder: string
    license: string
    series: string
    seriesTitle: string
    presenters: string[]
    contributors: string[]
    startDate: Date
    duration: number
    location: string
    source: string
    created: Date
    // ... more properties
}>
```

Contains descriptive information of the event.

### Main properties

- **title**: Event title
- **description**: Event description
- **presenters**: List of presenters
- **contributors**: List of contributors
- **startDate**: Event start date
- **duration**: Duration in seconds
- **series**: ID of the series it belongs to
- **seriesTitle**: Series title
- **language**: Event language
- **location**: Location where it was recorded

## Track

```typescript
export interface Track {
    id: string
    type: string
    mimetype: string
    url: string
    duration?: number
    // ... more properties
}
```

Represents a media track (video or audio).

### Properties

- **id**: Unique track identifier
- **type**: Track type (e.g., "presenter/source", "presentation/source")
- **mimetype**: File MIME type
- **url**: Media track URL
- **duration**: Track duration

## Attachment

```typescript
export interface Attachment {
    id: string
    type: string
    mimetype: string
    url: string
    // ... more properties
}
```

Represents a file attached to the event.

## Catalog

```typescript
export interface Catalog {
    id: string
    type: string
    mimetype: string
    url: string
    // ... more properties
}
```

Represents a catalog associated with the event.

## Segment

```typescript
export interface Segment {
    time: number
    duration?: number
    title?: string
    // ... more properties
}
```

Represents a temporal segment of the event.

## Data sources

The `Event` interface normalizes data that can come from two different sources in Opencast:

### 1. Engage Service

Traditional Opencast service for content delivery.

### 2. External API

Opencast external API that provides programmatic access to events.

## Event conversion

The package includes specific converters to transform data from these sources to the `Event` format:

- **EngageEventConversor**: For events from the Engage service
- **APIEventConversor**: For events from the external API

## Usage example

```typescript
import { OpencastPaellaPlayer } from '@asicupv/paella-opencast-core';

const player = new OpencastPaellaPlayer('container', {
    // configuration...
});

// Get the current event
const event = player.getEvent();

// Access metadata
console.log('Title:', event.metadata?.title);
console.log('Presenters:', event.metadata?.presenters);
console.log('Duration:', event.metadata?.duration);

// Access media tracks
event.tracks?.forEach(track => {
    console.log(`Track ${track.type}: ${track.url}`);
});

// Check access permissions
const canRead = event.acl?.some(acl => 
    acl.action === 'read' && acl.allow
);
```

## See also

- [Event converters](/paella-opencast/reference/paella-opencast-core/event-conversor)
- [OpencastPaellaPlayer](/paella-opencast/reference/paella-opencast-core/opencast-paella-player)
