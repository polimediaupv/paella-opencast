---
title: "Editor Plugin"
description: This plugin adds a button to access the Opencast video editor.
---

## org.opencast.paella.editorPlugin

This plugin adds a button in the player interface that allows access to the Opencast video editor to modify and enhance video content.

The configurations for this plugin are done per tenant. You need to modify the `plugins` section of the paella configuration file.

**Exported as** `OpencastEditorPlugin`.

## Configuration

You need to enable the `org.opencast.paella.editorPlugin` plugin.

```json
{
    "org.opencast.paella.editorPlugin": {
        "enabled": true,
        "side": "right",
        "showIfAnonymous": false,
        "showIfCanWrite": true,
        "editorUrl": "/editor-ui/index.html?id={id}"
    }    
}
```

## Configuration parameters

- **`enabled`**: Enables or disables the plugin.
  - Valid values: `true` / `false`

- **`showIfAnonymous`**: Determines if the button should be shown when the user is not authenticated.
  - Valid values: `true` / `false`
  - Default: `false`

- **`showIfCanWrite`**: Determines if the button should be shown only when the user has write permissions on the content.
  - Valid values: `true` / `false` 
  - Default: `true`

- **`editorUrl`**: URL of the Opencast video editor. The `{id}` placeholder will be automatically replaced with the current video ID.
  - Example: `"/editor-ui/index.html?id={id}"`

## Behavior

The plugin is only available when using the Opencast Paella Player. Its visibility depends on the following factors:

1. **Anonymous user**: If the user is not authenticated, the button is only shown if `showIfAnonymous` is set to `true`.

2. **Authenticated user**: If the user is authenticated:
   - If `showIfCanWrite` is set to `true`, the button is only shown if the user has write permissions
   - If `showIfCanWrite` is set to `false`, the button is shown for any authenticated user

3. **Editor URL**: It is mandatory to configure `editorUrl` for the plugin to work correctly.

## Functionality

When clicking the button, the user will be redirected to the Opencast video editor, where they can:
- Edit and trim video content
- Add annotations and markers
- Modify video structure
- Perform other editing operations available in Opencast

## Icon customization:

- Icon names:
    * `buttonIcon`