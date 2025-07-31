---
title: "Matomo User Tracking Data Plugin"
description: This plugin extends the Matomo user tracking functionality with Opencast-specific user data.
---

## org.opencast.paella.matomo.userTrackingDataPlugin

This plugin extends the base Matomo user tracking functionality by providing Opencast-specific user identification. It integrates with the Opencast authentication system to track user interactions with video content.

This plugin requires the `@asicupv/paella-user-tracking` package to be installed and depends on the base Matomo tracking functionality.

**Exported as** `OpencastMatomoUserTrackingDataPlugin`.

## Configuration

You need to enable the `org.opencast.paella.matomo.userTrackingDataPlugin` plugin and configure it with your Matomo settings.

```json
{
  "org.opencast.paella.matomo.userTrackingDataPlugin": {
    "enabled": false,    
    "logUserId": true,
    ... // Other params inherited from Matomo Plugin
  }   
}
```

## Configuration parameters

- **`enabled`**: Enables or disables the plugin.
  - Valid values: `true` / `false`

- **`logUserId`**: Determines whether to log the Opencast user ID for tracking.
  - Valid values: `true` / `false`
  - Default: `false`

### Inherited Matomo parameters

The following parameters are inherited from the base Matomo tracking plugin:

- **`server`**: URL of your Matomo analytics server.
  - Example: `"https://analytics.yourdomain.com/"`

- **`siteId`**: Numeric site ID configured in your Matomo instance.
  - Example: `1`

- **`heartBeatTimer`**: Interval in seconds for sending heartbeat signals.
  - Example: `15`

- **`cookieDomain`**: Domain for Matomo cookies (optional).
  - Example: `"*.yourdomain.com"`

## Behavior

- **User identification**: When `logUserId` is enabled, retrieves the authenticated user's name from Opencast
- **Error handling**: Gracefully handles authentication errors and continues tracking without user identification
- **Privacy-aware**: Only tracks user ID when explicitly configured to do so

## Functionality

This plugin enhances standard Matomo tracking by:

1. **User identification**: Retrieves the logged-in Opencast username for tracking purposes
2. **Seamless integration**: Works with existing Matomo configurations
3. **Error resilience**: Continues functioning even if user identification fails
4. **Privacy compliance**: User ID tracking is optional and disabled by default

## Dependencies

- `@asicupv/paella-user-tracking` package
- A configured Matomo analytics server

## Privacy considerations

When `logUserId` is enabled, the plugin will attempt to retrieve and track the Opencast username. Ensure this complies with your privacy policy and data protection regulations.