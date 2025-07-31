---
title: OpencastPaellaPlayer
description: Main Paella player class for Opencast
---

The `OpencastPaellaPlayer` class is the main component of the `paella-opencast-core` package. It extends the `Paella` class from the `@asicupv/paella-core` and adds specific functionalities for working with Opencast.

## Constructor

```typescript
constructor(containerElement: HTMLElement | string, opencastParams: OpencastInitParams = {})
```

### Parameters

- **containerElement**: `HTMLElement | string` - The container element where the player will be mounted
- **opencastParams**: `OpencastInitParams` - Opencast-specific initialization parameters ([OpencastInitParams](/paella-opencast/reference/paella-opencast-core/opencast-init-params))

## Properties

### opencastPresentationUrl

```typescript
readonly opencastPresentationUrl: string | null
```

Base URL of the Opencast presentations server.

### opencastAuth

```typescript
readonly opencastAuth: OpencastAuth
```

Instance of the [Opencast authentication](/paella-opencast/reference/paella-opencast-core/opencast-auth) system.

## Methods

### getUrlFromOpencastServer

```typescript
getUrlFromOpencastServer(url: string): string | null
```

Builds a complete URL based on the Opencast presentations server URL.

**Parameters:**
- `url`: string - Relative or absolute URL

**Returns:** The complete URL or `null` if no presentation URL is configured.

### getEvent

```typescript
getEvent(): Event
```

Gets the Opencast [event](/paella-opencast/reference/paella-opencast-core/event) from the video manifest.

**Returns:** The `Event` object containing the event information.

### applyOpencastTheme

```typescript
async applyOpencastTheme(): Promise<void>
```

Applies the Opencast visual theme to the player.

## Configuration

The class accepts extended configuration that includes Opencast-specific options:

```typescript
export interface OpencastPaellaConfig extends Config {
    opencast?: {
        auth?: string;
        conversionConfig?: ConversionConfig;
    }
}
```

## Usage example

```typescript
import { OpencastPaellaPlayer } from '@asicupv/paella-opencast-core';

const player = new OpencastPaellaPlayer('player-container', {    
    // player configuration
    ...
});

// Apply Opencast theme
await player.applyOpencastTheme();

// Get event information
const event = player.getEvent();
console.log('Event title:', event.metadata?.title);
```

## Additional functionalities

- **Internationalization**: Automatically adds language dictionaries for Opencast
- **Skin integration**: Automatically loads Opencast CSS styles
- **URL management**: Facilitates the construction of URLs relative to the Opencast server
- **Authentication**: Integrates the authentication system with the player

## See also

- [OpencastInitParams](/paella-opencast/reference/paella-opencast-core/opencast-init-params/)
- [OpencastAuth](/paella-opencast/reference/paella-opencast-core/opencast-auth/)
- [Event](/paella-opencast/reference/paella-opencast-core/event/)
