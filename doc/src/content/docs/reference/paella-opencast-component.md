---
title: Paella Opencast Component
description: Documentation for the paella-opencast-component package
---

The `@asicupv/paella-opencast-component` package provides a ready-to-use HTML custom element that wraps all the functionality of Paella Player for Opencast integration. This component offers a simple, declarative way to embed Opencast video players in web applications using standard HTML attributes.

## Installation

```bash
npm install @asicupv/paella-opencast-component
```

## Main features

- **Custom HTML Element**: Simple `<paella-opencast-player>` tag for easy integration
- **Automatic configuration**: Fetches configuration and episode data from Opencast automatically
- **Attribute-based configuration**: Configure the player using HTML attributes
- **Complete plugin suite**: Includes all basic, slide, zoom, video, WebGL, extra, and Opencast-specific plugins
- **Authentication support**: Built-in authentication handling with Opencast
- **Theme integration**: Automatic Opencast theme application
- **Responsive design**: Adapts to container size automatically

## Component registration

The package automatically registers the custom element when imported:

```typescript
import '@asicupv/paella-opencast-component';

// The <paella-opencast-player> element is now available
```

## HTML attributes

The component accepts the following attributes for configuration:

### Required attributes

- **`video-id`**: The Opencast event ID to load

### Optional attributes

- **`opencast-presentation-url`**: Base URL of the Opencast presentation server
- **`paella-resources-url`**: URL path for Paella configuration resources (default: `/ui/config/paella8/`)
- **`paella-config`**: JSON string with Paella configuration (if not provided, fetched from server)
- **`opencast-episode`**: JSON string with episode data (if not provided, fetched from search API)
- **`opencast-user-name`**: Username for authentication (if not provided, fetched from `/info/me.json`)
- **`opencast-user-canWrite`**: Write permission flag (`true`/`false`)

## Usage examples

### Basic usage with automatic data fetching

The simplest way to use the component is with just the required attributes:

```html
<paella-opencast-player 
  video-id="ID-cats" 
  opencast-presentation-url="https://stable.opencast.org/">
</paella-opencast-player>
```

### Custom configuration path

You can specify a custom path for Paella configuration resources:

```html
<paella-opencast-player 
  video-id="your-video-id"
  opencast-presentation-url="https://your-opencast.org/"
  paella-resources-url="/custom/config/path/">
</paella-opencast-player>
```

### Manual data passing

For more control, you can pass configuration and episode data directly:

```html
<paella-opencast-player 
  video-id="your-video-id"
  paella-config='{"plugins": [...], "defaultVideoPreview": "..."}'
  opencast-episode='{"mediapackage": {...}, "search-results": {...}}'>
</paella-opencast-player>
```

### Authentication configuration

You can provide user authentication information directly:

```html
<paella-opencast-player 
  video-id="your-video-id"
  opencast-presentation-url="https://your-opencast.org/"
  opencast-user-name="john.doe"
  opencast-user-canWrite="true">
</paella-opencast-player>
```

## JavaScript integration

You can also interact with the component programmatically:

```typescript
import '@asicupv/paella-opencast-component';

// Get reference to the component
const playerElement = document.querySelector('paella-opencast-player');

// Access the underlying Paella player instance
const paellaPlayer = playerElement.paella;

// Change attributes dynamically
playerElement.setAttribute('video-id', 'new-video-id');
```

## Included plugins

The component includes a comprehensive set of plugins:

- **Basic plugins**: Essential player functionality
- **Slide plugins**: Presentation slide support
- **Zoom plugins**: Video zoom and pan capabilities
- **Video plugins**: Advanced video processing
- **WebGL plugins**: Hardware-accelerated rendering
- **Extra plugins**: Additional functionality
- **Opencast plugins**: Opencast-specific features

## Styling

The component includes all necessary CSS automatically. You can customize the appearance by targeting the custom element:

```css
paella-opencast-player {
  width: 100%;
  height: 500px;
  display: block;
  border-radius: 8px;
  overflow: hidden;
}
```

## Dependencies

This package includes the following dependencies:

- `@asicupv/paella-opencast-core`: Core Opencast functionality
- `@asicupv/paella-opencast-plugins`: Opencast-specific plugins
- `@asicupv/paella-basic-plugins`: Essential player plugins
- `@asicupv/paella-extra-plugins`: Additional functionality
- `@asicupv/paella-slide-plugins`: Presentation support
- `@asicupv/paella-video-plugins`: Video processing
- `@asicupv/paella-webgl-plugins`: WebGL rendering
- `@asicupv/paella-zoom-plugin`: Zoom functionality

## Browser compatibility

The component uses modern web standards including:

- Custom Elements v1
- ES Modules
- Async/await
- Modern CSS features

Supported browsers include all modern versions of Chrome, Firefox, Safari, and Edge.

## Related documentation

- [Paella Opencast Core](/paella-opencast/reference/paella-opencast-core/)
- [Paella Opencast Plugins](/paella-opencast/reference/paella-opencast-plugins/)
- [Web Component guide](/paella-opencast/guides/web-component/)
