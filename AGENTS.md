This file provides guidance to AI coding agents when working with code in this repository.

## Project Overview

Flood is a modern web UI for various torrent clients (rTorrent, qBittorrent, Transmission, Deluge) with multi-user and multi-client support. Built with TypeScript, React, MobX, and Node.js/Fastify.

## CRITICAL: Iterative Development Process

**⚠️ IMPORTANT: Validate early and often. Never make large changes without validation.**

### Development Workflow - Run These Frequently!

```bash
# After EVERY few edits (catches issues immediately):
pnpm run check-types             # TypeScript compilation check - RUN THIS OFTEN!
pnpm run lint                    # ESLint with TypeScript rules (max warnings: 0)

# Before committing any changes:
pnpm run format-source           # Prettier auto-fix all files (prettier -w .)
pnpm run check-source-formatting # Verify formatting is correct (prettier -c .)
pnpm run build                   # Ensure production build works (panda codegen + build)
pnpm run test                        # Run tests to catch regressions

# Note: lint-staged runs automatically on git commits via Husky hooks
```

### Why This Matters

- **TypeScript errors compound** - One type error can cascade into dozens
- **Lint errors block CI** - PR will fail if linting fails
- **Build failures are expensive** - Finding issues after large changes is painful
- **Small, validated changes** - Easier to debug and review

### Recommended Development Pattern

1. Make small, focused changes (< 50 lines)
2. Run `pnpm run check-types` immediately
3. Fix any type errors before continuing
4. Run `pnpm run lint` after each component/function
5. Test the specific feature you changed
6. Only then move to the next change

### Essential Commands

### Build & Run

```bash
# Package Manager: pnpm (v9.7.0) is the project's package manager
pnpm install --frozen-lockfile  # Install dependencies with lockfile
pnpm run build                   # Build production (esbuild for server, webpack for client)
pnpm start                       # Start production server (node --enable-source-maps dist/index.js)
pnpm start -- --port 8080       # With custom options (pass args after --)
```

### Development Mode

```bash
pnpm run start:development:server  # Server with tsx watch mode (hot reload via tsx watch)
pnpm run start:development:client  # Client webpack-dev-server (port 4200, with Panda CSS watch)
# Run both in separate terminals for full development environment
```

**Frontend Development Tips:**

- Client auto-proxies API calls to server (default: http://127.0.0.1:3000)
- HMR (Hot Module Replacement) enabled for instant updates
- React Refresh preserves component state during edits
- Source maps enabled for debugging

### Testing

```bash
pnpm test                        # Run all Vitest integration tests (spawns real torrent clients!)
pnpm test:watch                  # Watch mode with Vitest
pnpm test -- --project rtorrent server/routes/api/torrents.test.ts  # Run a specific server test against rTorrent
pnpm run test:client             # Cypress E2E tests (requires server on port 4200)
pnpm run test-storybook          # Run Storybook interaction tests

# Test specific torrent clients (runs relevant Vitest project):
pnpm test -- --project rtorrent
pnpm test -- --project qbittorrent
pnpm test -- --project transmission
pnpm test -- --project auth
```

## Critical Architectural Patterns

### Frontend State Management

- **MobX with decorators** for reactive state
- **Computed values** for derived state (filtered/sorted torrents)
- **Fast-json-patch** for efficient diff updates from server
- Pattern: `makeAutoObservable(this)` in store constructors

### Real-time Updates via SSE

- Server-Sent Events at `/api/activity-stream`
- Server sends either:
  - `TORRENT_LIST_FULL_UPDATE` - Complete torrent list
  - `TORRENT_LIST_DIFF_CHANGE` - JSON Patch operations array
- Client applies patches directly to MobX stores
- Connection auto-retries on failure (retry: 500ms)
- Keep-alive pings every 500ms
- Server tracks previous state per connection for efficient diffs

### API Validation with Zod

All API endpoints use Zod schemas for validation:

```typescript
fastify.route({
  ...,
  schema: {
    body: RequestBodySchema,
  },
  ...,
})
```

### Database: NeDB (Embedded)

- Located in `~/.local/share/flood/` by default
- `users.db` - User accounts with argon2 hashed passwords
- `settings.db` - User settings
- Auto-compaction enabled

### Build Process

- **Server**: esbuild bundles to single file (`dist/index.js`) with source maps
- **Client**: webpack with code splitting, CSS extraction, asset optimization
- **Assets**: Static files copied to `dist/assets/`
- **CSS**: Panda CSS generates styled-system via `panda codegen`

## Code Style & Conventions

### Formatting (Prettier)

```json
{
  "bracketSpacing": false,
  "printWidth": 120,
  "singleQuote": true,
  "trailingComma": "all"
}
```

### Import Rules

- Use `node:` prefix for Node.js builtins (`node:fs`, `node:path`)
- Simple import sorting enforced (except in client code for CRA parity)
- Path aliases configured in tsconfig.json:
  - `@client/*` → `client/src/javascript/*`
  - `@server/*` → `server/*`
  - `@shared/*` → `shared/*`

### TypeScript Patterns

- Strict mode enabled
- Unused vars with `_` prefix are allowed
- `_id` underscore allowed for database IDs

## Architecture Deep Dive

### Torrent Client Adapters

Each client in `/server/services/[client]/` follows this pattern:

1. `clientRequestManager.ts` - Handles protocol-specific communication
2. `clientGatewayService.ts` - Implements common interface
3. `util/torrentPropertiesUtil.ts` - Normalizes client-specific data

**Protocol Details:**

- **rTorrent**: SCGI with XML-RPC or JSON-RPC (checks capability)
- **qBittorrent**: REST API with cookie-based session
- **Transmission**: JSON-RPC with session tokens
- **Deluge**: Rencode protocol over TCP

### Authentication Flow

1. JWT tokens issued on login, stored in httpOnly cookies
2. Passport.js validates tokens via `passport-jwt` strategy
3. Token contains username + issued-at timestamp
4. User lookup verifies token hasn't been issued before password change

### File Operations Gotchas

- **CRITICAL**: Flood must have same filesystem view as torrent client
- Path `/downloads/file` to torrent client = `/downloads/file` to Flood
- Cannot be `/mnt/different/downloads/file` - operations will fail
- Use `--allowedpath` to restrict file access

### i18n with Lingui

- JSON message catalogs in `/client/src/javascript/i18n/strings/`
- Lazy-loaded based on user preference
- Build extracts messages via Babel plugin

### Testing Infrastructure

Integration tests spawn actual torrent clients:

- Creates temporary directory with config
- Starts rTorrent/qBittorrent/Transmission
- Tests against real client behavior
- Cleans up processes after tests
- 20-second timeouts for client startup
- SSE stream testing via PassThrough streams
- Mocks HTTP requests with axios-mock-adapter

### Fastify

- The backends use fastify as http framework.

## Non-Obvious Implementation Details

### Diff-based Updates

- Server tracks previous torrent state per connection
- Sends JSON Patch operations for changes
- Reduces bandwidth for large torrent lists

### Request Queuing

- rTorrent adapter uses PQueue (concurrency: 1)
- Prevents SCGI connection issues
- Other clients handle concurrent requests

### Tag Validation

- Tags cannot contain commas (used as delimiter)
- Enforced via Zod regex: `/^[^,]*$/`

### Initial Seeding Mode

- Only available for specific torrent client versions
- Feature detection happens at runtime

### Temporary Storage

- Located in OS temp directory
- Used for torrent creation, file downloads
- Auto-cleaned on server restart

## Configuration Deep Dive

### Runtime Directory (`--rundir`)

Contains:

- `users.db` - User database
- `settings.db` - User settings
- `temp/` - Temporary files

### Base URI (`--baseuri`)

For reverse proxy setups:

- `/apps/flood` - Serves at subdirectory
- Must not have trailing slash in config
- Affects all HTTP endpoints and asset paths

### Development Environment Variables

- `DEV_SERVER_PORT` - webpack-dev-server port (default: 4200)
- `DEV_SERVER_HOST` - Dev server host (default: 0.0.0.0)
- `NODE_ENV=development` - Enables dev features

## Common Development Tasks

### Adding a New Torrent Client

1. Create `/server/services/NewClient/` directory
2. Implement `clientGatewayService.ts` extending `BaseService`
   - **Run `pnpm run check-types`** after implementing each method
3. Add connection settings schema in `/shared/schema/ClientConnectionSettings.ts`
   - **Run `pnpm run check-types`** to verify schema integration
4. Update service factory in `/server/services/index.ts`
5. **Run `pnpm run build`** to ensure everything compiles
6. **Run `pnpm test`** to verify no regressions

### Adding API Endpoint

1. Define Zod schema in `/shared/schema/api/`
   - **Run `pnpm run check-types`** after schema definition
2. Add route handler in `/server/routes/api/`
   - **Run `pnpm run lint`** to check route implementation
3. Create action in `/client/src/javascript/actions/`
   - **Run `pnpm run check-types`** to verify client-server contract
4. Update TypeScript types in `/shared/types/api/`
5. **Run `pnpm run build`** before testing the endpoint
6. Test the endpoint manually, then **run `pnpm test`**

### Modifying Torrent Properties

1. Update type in `/shared/types/Torrent.ts`
   - **Run `pnpm run check-types`** immediately - this affects many files!
2. Fix all TypeScript errors before proceeding
3. Modify normalizers in each client's `torrentPropertiesUtil.ts`
   - **Run `pnpm run check-types`** after each client adapter
4. Update torrent list columns if needed
5. **Run `pnpm run build`** to verify production build
6. **Run `pnpm test`** to ensure client adapters still work

## Debugging Tips

### When Things Go Wrong

- **TypeScript errors?** Run `pnpm run check-types` and fix from top to bottom
- **Lint errors?** Run `pnpm run lint` - most are auto-fixable with `pnpm run format-source`
- **Build fails?** Check both server (esbuild) and client (webpack) output
- **Tests fail?** Run specific test file with `pnpm test -- path/to/test`
- **Panda CSS issues?** Run `panda codegen` to regenerate styled-system

### Runtime Debugging

- Server-side debugging: VS Code launch config included
- Client-side: Use React DevTools + MobX DevTools
- SSE stream: Check Network tab for `/api/activity-stream`
- SCGI issues: Enable `NODE_ENV=development` for verbose logs

## Service Architecture Pattern

### Per-User Service Isolation

- Each user gets their own service instances (torrent client, settings, etc.)
- Services are bootstrapped on user login, destroyed on logout
- Cross-service communication via service references
- Event-driven updates via `onServicesUpdated()` callbacks

### Polling and Connection Management

- Adaptive polling rates based on active SSE connections
- Client connection health monitoring with auto-retry
- rTorrent: Single-threaded request queue (PQueue concurrency: 1)
- Other clients: Concurrent request handling

## Frontend Development Guide

### Client Development Environment

```bash
# Start both for full development:
npm run start:development:server  # Backend on port 3000 (tsx watch mode)
npm run start:development:client  # Frontend on port 4200 (webpack-dev-server)

# Frontend proxies API calls to backend (configurable):
npm run start:development:client -- --proxy http://localhost:3000
```

**Key Frontend Technologies:**

- **React 18** with hooks and functional components
- **MobX 6** for reactive state management (with decorators)
- **Panda CSS** for styling (replaced Emotion)
- **React Router 6** for routing
- **Lingui v5** for internationalization

### Storybook Component Development

```bash
npm run storybook               # Launch Storybook on port 6006
npm run build-storybook         # Build static Storybook
npm run test-storybook          # Run Storybook tests
```

**Storybook Architecture:**

- Stories located in `client/src/javascript/components/**/*.stories.tsx`
- Webpack aliases configured for `@client/` and `@shared/` paths
- Full CSS module support matching production webpack config
- Babel decorators enabled for MobX compatibility

### Frontend Mocking Strategy

#### 1. Action Mocking via Webpack NormalModuleReplacementPlugin

Storybook replaces real actions with mocks at build time:

```typescript
// In .storybook/main.ts
new webpack.NormalModuleReplacementPlugin(
  /@client\/actions\/FloodActions$/,
  path.resolve(__dirname, './mocks/FloodActions.ts'),
);
```

This ensures all imports of actions are replaced with mock implementations.

#### 2. Centralized Mock State Store

```typescript
// .storybook/mocks/MockStateStore.ts
class MockStateStore {
  private state: MockState = {
    torrents: {...TORRENT_STATES},
    settings: {...MOCK_FLOOD_SETTINGS},
    // ... other state
  };

  setState(updates: Partial<MockState>): void {
    /* ... */
  }
  reset(): void {
    /* ... */
  }
}
```

**Key Pattern:** Single source of truth for all mock data that:

- Provides preset torrent states (downloading, seeding, stopped, error)
- Manages settings and UI state
- Simulates real-time updates without network calls

#### 3. Story Setup Pattern

```typescript
const setupTorrent = (torrentState, viewSize = 'expanded') => ({
  loaders: [
    async () => {
      mockStateStore.reset();
      mockStateStore.setState({
        torrents: {[torrentState.hash]: torrentState},
        settings: {torrentListViewSize: viewSize},
      });
      FloodActions.startActivityStream(); // Triggers mock data load
    },
  ],
});
```

#### 4. Mock Actions Implementation

Mock actions simulate real behavior without network calls:

```typescript
// .storybook/mocks/FloodActions.ts
startActivityStream() {
  const state = mockStateStore.getState();

  // Simulate full torrent update
  TorrentStore.handleTorrentListFullUpdate(state.torrents);
  UIStore.satisfyDependency('torrent-list');

  // Simulate settings update
  SettingStore.handleSettingsFetchSuccess(state.settings);

  // Compute and send taxonomy
  TorrentFilterStore.handleTorrentTaxonomyFullUpdate(taxonomy);
}
```

### Frontend Store Architecture

**12 MobX Stores** managing different domains:

- `TorrentStore` - Torrent list and selection state
- `SettingStore` - User preferences and UI settings
- `UIStore` - UI state and dependency tracking
- `TransferDataStore` - Transfer rates and history
- `TorrentFilterStore` - Filtering and taxonomy
- `AuthStore` - Authentication state
- `ClientStatusStore` - Torrent client connection
- `NotificationStore` - System notifications
- `FeedStore` - RSS feed management
- `DiskUsageStore` - Disk usage monitoring
- `ConfigStore` - Application configuration
- `AlertStore` - User alerts and messages

**Store Pattern:**

```typescript
class Store {
  constructor() {
    makeAutoObservable(this); // Auto-observable for all properties
  }

  @computed get derivedValue() {
    /* ... */
  }
  @action updateValue() {
    /* ... */
  }
}
```

### Component Development Best Practices

1. **Create Stories for New Components:**

   - Test different states (loading, error, empty, full)
   - Test both expanded and condensed views
   - Test dark/light themes

2. **Use Mock State Store:**

   - Reset state between stories
   - Provide realistic test data
   - Simulate user interactions

3. **Test with Storybook Play Functions:**

   ```typescript
   play: async ({canvasElement}) => {
     const canvas = within(canvasElement);
     const element = await canvas.findByRole('button');
     expect(element).toBeInTheDocument();
   };
   ```

4. **CSS Modules Pattern:**

   - Use `.module.scss` for component styles
   - Import as `styles` object
   - Apply with `className={styles.className}`

5. **Panda CSS for New Components:**
   - Use styled-system utilities
   - Run `panda codegen` after config changes
   - Located in `client/src/javascript/styled-system/`

## Final Reminders

1. **Small changes, frequent validation** - This codebase has strict TypeScript
2. **Run `pnpm run check-types` after every change** - Seriously, every change
3. **CI will reject your PR** if lint/types/tests fail
4. **When in doubt, validate** - Better to check too often than debug for hours
