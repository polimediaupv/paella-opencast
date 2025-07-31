---
title: "Login Plugin"
description: This plugin adds a button to allow users to log in to access additional features.
---

## org.opencast.paella.loginPlugin

This plugin adds a login button in the player interface that allows users to authenticate and access additional features and personalized content.

The plugin is only available when using the Opencast Paella Player and is automatically shown to anonymous (non-authenticated) users.

**Exported as** `OpencastLoginPlugin`.

## Configuration

You need to enable the `org.opencast.paella.loginPlugin` plugin.

```json
{
    "org.opencast.paella.loginPlugin": {
        "enabled": true
    }    
}
```

## Configuration parameters

- **`enabled`**: Enables or disables the plugin.
  - Valid values: `true` / `false`

## Behavior

The plugin has the following behavior:

1. **Visibility**: Only shown to anonymous (non-authenticated) users
2. **Automatic hiding**: The button automatically disappears once the user is logged in

## Functionality

When clicked, the button triggers the Opencast authentication process, allowing users to:
- Access personalized content
- View additional features available to authenticated users
- Gain access permissions based on their user role

## Icon customization:

- Icon names:
    * `buttonIcon`