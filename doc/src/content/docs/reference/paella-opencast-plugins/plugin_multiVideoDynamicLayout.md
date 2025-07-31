---
title: "Multi Video Dynamic Layout"
description: This video layout plugin provides dynamic multi-video display capabilities for multiple video streams.
---

## org.opencast.paella.multiVideoDynamicLayout

This video layout plugin provides a dynamic layout system for displaying multiple video streams simultaneously. It automatically adjusts the layout based on the number of available video streams, distributing them evenly across the available space.

**Exported as** `OpencastMultiVideoDynamicLayout`.

## Configuration

You need to enable the `org.opencast.paella.multiVideoDynamicLayout` plugin.

```json
{
    "org.opencast.paella.multiVideoDynamicLayout": {
        "enabled": true
    }    
}
```

## Configuration parameters

- **`enabled`**: Enables or disables the layout plugin.
  - Valid values: `true` / `false`

## Behavior

- **Layout type**: Dynamic layout that adapts to content
- **Stream handling**: Accepts all available video streams
- **Automatic sizing**: Calculates equal size distribution for all videos
- **Visibility**: All videos are visible by default
- **Responsive**: Adapts to the number of available streams

## Layout characteristics

- **Video distribution**: Equal size allocation (100% / number of streams)
- **Content flexibility**: Works with any number of video streams
- **State preservation**: Maintains layout state once calculated


## Use cases

This layout is ideal for:

- **Multi-camera recordings** with multiple simultaneous video feeds
- **Lecture capture** with presenter and presentation cameras
- **Conference recordings** with multiple speakers or perspectives
- **Interactive content** requiring simultaneous video display
- **Comparative viewing** of multiple video sources


This layout provides maximum flexibility for multi-video content, automatically adapting to the specific requirements of each video event.