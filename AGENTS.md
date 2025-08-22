This file provides guidance to AI coding agents when working with code in this repository.

## Project Overview

Flood is a modern web UI for various torrent clients (rTorrent, qBittorrent, Transmission, Deluge) with multi-user and multi-client support. Built with TypeScript, React, MobX, and Node.js/Fastify.

## CRITICAL: Iterative Development Process

**⚠️ IMPORTANT: Validate early and often. Never make large changes without validation.**

### Development Workflow - Run These Frequently!

```bash
# After EVERY few edits (catches issues immediately):
npm run check-types             # TypeScript compilation check - RUN THIS OFTEN!
npm run lint                    # ESLint with TypeScript rules

# Before committing any changes:
npm run format-source           # Auto-fix formatting
npm run check-source-formatting # Verify formatting is correct
npm run build                   # Ensure production build works
npm test                        # Run tests to catch regressions
```

### Why This Matters

- **TypeScript errors compound** - One type error can cascade into dozens
- **Lint errors block CI** - PR will fail if linting fails
- **Build failures are expensive** - Finding issues after large changes is painful
- **Small, validated changes** - Easier to debug and review

### Recommended Development Pattern

1. Make small, focused changes (< 50 lines)
2. Run `npm run check-types` immediately
3. Fix any type errors before continuing
4. Run `npm run lint` after each component/function
5. Test the specific feature you changed
6. Only then move to the next change

### Essential Commands

### Build & Run

```bash
pnpm install --frozen-lockfile  # Install with pnpm (package manager)
npm run build                   # Build production (esbuild for server, webpack for client)
npm start                       # Start production server
npm start -- --port 8080       # With custom options
```

### Development Mode

```bash
npm run start:development:server  # Server with ts-node-dev hot reload
npm run start:development:client  # Client webpack-dev-server (port 4200)
```

### Testing

```bash
npm test                        # Run integration tests (spawns real torrent clients!)
npm test:watch                  # Watch mode
npm run test:client             # Cypress E2E tests
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
- Connection auto-retries on failure

### API Validation with Zod

All API endpoints use Zod schemas for validation:

```typescript
const parsedResult = addTorrentByURLSchema.safeParse(req.body);
if (!parsedResult.success) {
  return res.status(422).json({message: 'Validation error.'});
}
```

### Database: NeDB (Embedded)

- Located in `~/.local/share/flood/` by default
- `users.db` - User accounts with argon2 hashed passwords
- `settings.db` - User settings
- Auto-compaction enabled

### Build Process

- **Server**: esbuild bundles to single file (`dist/index.js`)
- **Client**: webpack with code splitting, CSS extraction
- **Assets**: Static files copied to `dist/assets/`

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
- Simple import sorting enforced
- Path aliases: `@client/`, `@shared/` mapped via TypeScript paths

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

### Fastify + Express Hybrid

- Fastify handles static files and main routes
- Express middleware via `@fastify/express` for:
  - Passport authentication
  - Body parsing
  - Cookie parsing
  - API routes

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
   - **Run `npm run check-types`** after implementing each method
3. Add connection settings schema in `/shared/schema/ClientConnectionSettings.ts`
   - **Run `npm run check-types`** to verify schema integration
4. Update service factory in `/server/services/index.ts`
5. **Run `npm run build`** to ensure everything compiles
6. **Run `npm test`** to verify no regressions

### Adding API Endpoint

1. Define Zod schema in `/shared/schema/api/`
   - **Run `npm run check-types`** after schema definition
2. Add route handler in `/server/routes/api/`
   - **Run `npm run lint`** to check route implementation
3. Create action in `/client/src/javascript/actions/`
   - **Run `npm run check-types`** to verify client-server contract
4. Update TypeScript types in `/shared/types/api/`
5. **Run `npm run build`** before testing the endpoint
6. Test the endpoint manually, then **run `npm test`**

### Modifying Torrent Properties

1. Update type in `/shared/types/Torrent.ts`
   - **Run `npm run check-types`** immediately - this affects many files!
2. Fix all TypeScript errors before proceeding
3. Modify normalizers in each client's `torrentPropertiesUtil.ts`
   - **Run `npm run check-types`** after each client adapter
4. Update torrent list columns if needed
5. **Run `npm run build`** to verify production build
6. **Run `npm test`** to ensure client adapters still work

## Debugging Tips

### When Things Go Wrong

- **TypeScript errors?** Run `npm run check-types` and fix from top to bottom
- **Lint errors?** Run `npm run lint` - most are auto-fixable with `npm run format-source`
- **Build fails?** Check both server (esbuild) and client (webpack) output
- **Tests fail?** Run specific test file with `npm test -- path/to/test`

### Runtime Debugging

- Server-side debugging: VS Code launch config included
- Client-side: Use React DevTools + MobX DevTools
- SSE stream: Check Network tab for `/api/activity-stream`
- SCGI issues: Enable `NODE_ENV=development` for verbose logs

## Final Reminders

1. **Small changes, frequent validation** - This codebase has strict TypeScript
2. **Run `npm run check-types` after every change** - Seriously, every change
3. **CI will reject your PR** if lint/types/tests fail
4. **When in doubt, validate** - Better to check too often than debug for hours
