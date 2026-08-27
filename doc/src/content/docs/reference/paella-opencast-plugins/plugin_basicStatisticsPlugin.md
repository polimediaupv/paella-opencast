---
title: "Basic Statistics Plugin"
description: This plugin sends analytics to Opencast, to be aggregated into basic statistics like view count
---

## org.opencast.paella.basicStatisticsPlugin

This plugin runs in the background an periodically sends analytics to Opencast. Stuff like when did the user press play, pause, or which parts of the video they watched.

**Exported as** `BasicStatisticsPlugin`.

## Configuration

You need to enable the `org.opencast.paella.basicStatisticsPlugin` plugin.

```json
{
  "org.opencast.paella.downloadsPlugin": {
    "enabled": true,
  }
}
```

## Configuration parameters

- **`enabled`**: Enables or disables the plugin.
  - Valid values: `true` / `false`
