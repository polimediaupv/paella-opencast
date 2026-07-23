---
title: "Basic Statistics Plugin"
description: This plugin sends analytics to Opencast, to be aggregated into basic statistics like view count
---

## org.opencast.paella.basicStatisticsPlugin

This plugin runs in the background and periodically sends analytics to Opencast, such as when the user pressed play or pause, and which parts of the video they watched.

**Exported as** `OpencastBasicStatisticsPlugin`.

## Configuration

You need to enable the `org.opencast.paella.basicStatisticsPlugin` plugin.

```json
{
  "org.opencast.paella.basicStatisticsPlugin": {
    "enabled": true
  }
}
```

## Configuration parameters

- **`enabled`**: Enables or disables the plugin.
  - Valid values: `true` / `false`
