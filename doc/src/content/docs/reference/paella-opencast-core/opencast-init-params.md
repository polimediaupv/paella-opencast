---
title: OpencastInitParams
description: Initialization parameters for OpencastPaellaPlayer
---

The `OpencastInitParams` interface extends the standard Paella Player initialization parameters with Opencast-specific options.

## OpencastInitParams Interface

```typescript
export interface OpencastInitParams extends InitParams {
    opencast?: {        
        presentationUrl?: string | null
        auth?: OpencastAuth | null
        videoId?: string | null
        paellaConfig?: string | Partial<Config> | null
        episode?: string | null
    }
}
```

### Properties

#### presentationUrl

```typescript
presentationUrl?: string | null
```

Base URL of the Opencast presentations server. This URL is used to construct all relative URLs to Opencast services.

**Example:**
```typescript
presentationUrl: 'https://opencast.example.com'
```

#### auth

```typescript
auth?: OpencastAuth | null
```

Custom authentication system instance. If not provided, `OpencastAuthDefaultImpl` is used.

#### videoId

```typescript
videoId?: string | null
```

Identifier of the video/event to play. If not provided, it attempts to get it from:
1. URL parameter `id`
2. URL hash
3. `fallbackId` from configuration

#### paellaConfig

```typescript
paellaConfig?: string | Partial<Config> | null
```

Paella Player configuration. Can be:
- **String**: JSON string that will be parsed
- **Object**: Partial configuration object
- **null**: Will be loaded from configuration file

#### episode

```typescript
episode?: string | null
```

Event data in JSON string format. If provided, it's used directly without making additional requests to the server.

## Helper functions

### defaultLoadConfigFunc

```typescript
export async function defaultLoadConfigFunc(configUrl: string, player: Paella): Promise<Config>
```

Default function for loading Paella Player configuration from Opencast.

**Behavior:**
1. If `paellaConfig` is a string, parses it as JSON
2. If `paellaConfig` is an object, uses it directly
3. If there's no `paellaConfig`, loads from the provided URL
4. Builds relative URLs using `presentationUrl`

### defaultGetVideoIdFunc

```typescript
export async function defaultGetVideoIdFunc(config: Config, player: Paella): Promise<string | null>
```

Default function for getting the video ID.

**Priority order:**
1. `videoId` from `OpencastInitParams`
2. URL parameter `id`
3. `fallbackId` from configuration
4. Throws error if no ID is found

### defaultLoadVideoManifestFunc

```typescript
export async function defaultLoadVideoManifestFunc(_manifestUrl: string, _config: Config, player: Paella): Promise<Manifest>
```

Default function for loading the video manifest from Opencast.

**Behavior:**
1. If there's data in `episode`, uses it directly
2. If not, makes request to `/search/episode.json?id=${videoId}`
3. Auto-discovers if it's search API or external API
4. Converts data to Paella `Manifest` format

## Automatic configuration

When creating an `OpencastPaellaPlayer`, default functions are automatically configured:

```typescript
const player = new OpencastPaellaPlayer('container', {
    // Automatically configured:
    // loadConfigFunc: defaultLoadConfigFunc
    // getVideoIdFunc: defaultGetVideoIdFunc  
    // loadVideoManifestFunc: defaultLoadVideoManifestFunc
});
```

## Usage examples

### Basic configuration

```typescript
const player = new OpencastPaellaPlayer('player-container', {
    opencast: {
        presentationUrl: 'https://opencast.example.com',
        videoId: 'event-123'
    }
});
```

### With custom configuration

```typescript
const player = new OpencastPaellaPlayer('player-container', {
    opencast: {
        presentationUrl: 'https://opencast.example.com',
        videoId: 'event-123',
        paellaConfig: {
            // Specific player configuration
            plugins: {
                // plugin configuration
            }
        }
    }
});
```

### With predefined event data

```typescript
const eventData = JSON.stringify({
    // Opencast event data
    mediapackage: {
        id: 'event-123',
        title: 'My event'
        // ... more data
    }
});

const player = new OpencastPaellaPlayer('player-container', {
    opencast: {
        presentationUrl: 'https://opencast.example.com',
        episode: eventData
    }
});
```

### With custom authentication

```typescript
import { OpencastAuth } from '@asicupv/paella-opencast-core';

class CustomAuth implements OpencastAuth {
    // Custom implementation
}

const player = new OpencastPaellaPlayer('player-container', {
    opencast: {
        presentationUrl: 'https://opencast.example.com',
        videoId: 'event-123',
        auth: new CustomAuth()
    }
});
```

## API auto-discovery

The system can automatically work with two types of Opencast APIs:

- Search API (Engage Service)

    When making a request to `/search/episode.json`, the converter automatically detects the format and uses `EngageEventConversor`.

- External API

    If data comes from the external API, `APIEventConversor` is automatically used.


## See also

- [OpencastPaellaPlayer](/paella-opencast/reference/paella-opencast-core/opencast-paella-player)
- [OpencastAuth](/paella-opencast/reference/paella-opencast-core/opencast-auth)
- [Event converters](/paella-opencast/reference/paella-opencast-core/event-conversor)
