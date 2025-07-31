---
title: OpencastAuth
description: Authentication system for Opencast
---

The `OpencastAuth` authentication system provides an interface for managing authentication and authorization with Opencast services.

## OpencastAuth Interface

```typescript
export interface OpencastAuth {
    getLoggedUserName: () => Promise<string | null>
    isAnonymous: () => Promise<boolean>
    canRead: () => Promise<boolean>
    canWrite: () => Promise<boolean>
    auth: (redirectUrl?: string) => Promise<void>
}
```

### Methods

#### getLoggedUserName

```typescript
getLoggedUserName(): Promise<string | null>
```

Gets the name of the authenticated user.

**Returns:** The user name or `null` if not authenticated.

#### isAnonymous

```typescript
isAnonymous(): Promise<boolean>
```

Checks if the current user is anonymous.

**Returns:** `true` if the user is anonymous, `false` otherwise.

#### canRead

```typescript
canRead(): Promise<boolean>
```

Checks if the user has read permissions.

**Returns:** `true` if they have read permissions, `false` otherwise.

#### canWrite

```typescript
canWrite(): Promise<boolean>
```

Checks if the user has write permissions.

**Returns:** `true` if they have write permissions, `false` otherwise.

#### auth

```typescript
auth(redirectUrl?: string): Promise<void>
```

Starts the authentication process.

**Parameters:**
- `redirectUrl`: string (optional) - URL to redirect to after authentication



## OpencastAuthDefaultImpl

Default implementation of the Opencast authentication system.

```typescript
export class OpencastAuthDefaultImpl implements OpencastAuth
```

### Constructor

```typescript
constructor(player?: OpencastPaellaPlayer)
```

**Parameters:**
- `player`: OpencastPaellaPlayer (optional) - Player instance

### Properties

#### player

```typescript
get player(): OpencastPaellaPlayer | null
set player(player: OpencastPaellaPlayer)
```

Reference to the Paella Opencast player.

### Functionalities

The default implementation:

- **Gets user information** from the `/info/me.json` Opencast endpoint
- **Caches user information** to avoid multiple requests
- **Handles authentication errors** gracefully
- **Integrates with player logging** for debugging

### User information endpoint

The implementation uses the standard Opencast endpoint:

```
GET /info/me.json
```

This endpoint returns information about the current authenticated user, including:
- Username
- Roles and permissions
- Authentication status

## Configuration

Authentication can be configured in the initialization parameters:

```typescript
const player = new OpencastPaellaPlayer('container', {
    opencast: {
        auth: new CustomAuthImpl(), // Custom implementation
        // or use default implementation (automatic)
    }
});
```

## Usage example

```typescript
import { OpencastPaellaPlayer, OpencastAuthDefaultImpl } from '@asicupv/paella-opencast-core';

const auth = new OpencastAuthDefaultImpl();
const player = new OpencastPaellaPlayer('player-container', {
    opencast: {
        auth: auth,
        presentationUrl: 'https://opencast.example.com'
    }
});
```




## See also

- [OpencastPaellaPlayer](/paella-opencast/reference/paella-opencast-core/opencast-paella-player)
- [OpencastInitParams](/paella-opencast/reference/paella-opencast-core/opencast-init-params)
