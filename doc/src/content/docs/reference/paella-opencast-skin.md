---
title: Paella Opencast Skin
description: Documentation for the paella-opencast-skin package
---

The `@asicupv/paella-opencast-skin` package provides a complete visual theme for Paella Player that follows Opencast's design guidelines. This package includes custom styling, iconography, and visual components that create a cohesive and professional appearance for Opencast video players.

## Installation

```bash
npm install @asicupv/paella-opencast-skin
```

## Main features

- **Opencast-branded theme**: Visual design that matches Opencast's interface
- **Complete icon set**: Custom SVG icons for all player controls
- **CSS custom properties**: Extensive theming system using CSS variables
- **Typography integration**: Roboto font family for consistent text rendering
- **Responsive design**: Optimized for different screen sizes and devices
- **Plugin compatibility**: Icons and styling for all major plugins

## Theme structure

The skin package exports a theme configuration that includes:

### Style sheets
- Custom CSS with design tokens and component styling
- Roboto font integration from Google Fonts

### Icon mappings
- Complete icon set for all Paella Player plugins
- SVG-based icons for scalability and performance
- Consistent visual language across all controls

## Usage

To apply the Opencast skin to your Paella Player:

```typescript
import { OpencastPaellaPlayer } from '@asicupv/paella-opencast-core';
import { theme } from '@asicupv/paella-opencast-skin';


const player = new OpencastPaellaPlayer('player-container', config);
// Apply the Opencast theme
await player.applyOpencastTheme();

```


## Browser compatibility

The skin uses modern CSS features:

- CSS Custom Properties (variables)
- SVG icons
- Flexbox layouts
- CSS Grid (where appropriate)

Supported in all modern browsers including Chrome, Firefox, Safari, and Edge.


## Related documentation

- [Paella Opencast Core](/paella-opencast/reference/paella-opencast-core/)
- [Paella Opencast Component](/paella-opencast/reference/paella-opencast-component/)
- [Paella Theme customization guide](https://paellaplayer.webs.upv.es/reference/styling_css_variables/)
