---
title: Paella Opencast Core
description: Documentation for the paella-opencast-core package
---

The `@asicupv/paella-opencast-core` package is the main library that provides basic functionality for integrating Paella Player with Opencast. This package extends the capabilities of `@asicupv/paella-core` by adding specific functionalities for working with Opencast events.

## Installation

```bash
npm install @asicupv/paella-opencast-core
```

## Main features

- **Specialized player**: Extends Paella Player with Opencast-specific functionalities
- **Authentication**: Integrated authentication system with Opencast
- **Event conversion**: Converters for different Opencast event formats
- **Theme support**: Integration with Opencast visual theme
- **Internationalization**: Complete support for multiple languages

## Main components

### OpencastPaellaPlayer

The main class that extends `Paella` and provides Opencast-specific functionalities.

### OpencastAuth

Authentication system for working with Opencast services.

### Event

Interface that defines the normalized Opencast event structure for Paella Player.

### Event converters

- **EngageEventConversor**: For events from Opencast's Engage service
- **APIEventConversor**: For events from Opencast's external API


## Related documentation

- [OpencastPaellaPlayer](/paella-opencast/reference/paella-opencast-core/opencast-paella-player)
- [Authentication](/paella-opencast/reference/paella-opencast-core/opencast-auth)
- [Events](/paella-opencast/reference/paella-opencast-core/event)
- [Event converters](/paella-opencast/reference/paella-opencast-core/event-conversor)
