# Focus Tracker

A local-first Electron app that captures process and window activity on your own machine, normalizes it into stable app identities, and builds a picture of what you were actually doing: which apps had your foreground attention, which were running in the background, and how that changed over a session. React UI on top shows a session timeline, a live event feed, and the current workspace state.

Nothing here captures window titles, document names, or tab content. The collectors only ever see process/app identity, window size class, and monitor position, never the text inside a window.

## Why I built it

[Fill in: what you wanted to measure about your own work patterns, or what prompted building this instead of using an existing time tracker.]

## How to run

This is two processes: the React UI (served by Vite) and the Electron shell that captures telemetry and hosts it.

Terminal 1, start the UI:

```bash
cd ui
npm install
npm run dev
```

Terminal 2, from the project root, start Electron:

```bash
npm install
npm run electron:only
```

Electron loads the UI from the Vite dev server and starts the process/window/focus trackers as soon as the window is ready. Raw events land in `process_events.ndjson`, `app_events.ndjson`, and `workspace_events.ndjson` in your OS's per-user app data directory.

For a plain-text summary of focus time without opening the UI:

```bash
npm run summarize
```

Note: the root `dev` and `start` scripts in `package.json` don't currently produce a working app on their own, `dev` serves from the project root where there's no `index.html`, and `start` runs the Electron main file under plain Node, which can't load Electron's app APIs. The two-terminal flow above is what actually works. Worth fixing before this is the first thing someone runs.

## Design decision worth discussing: normalization before the session builder

Raw process and window data is noisy: the same app shows up under different casing, with or without `.exe`, sometimes as a full path. Minimized, tool, and system windows shouldn't count as "focus" at all, and every platform has its own list of background processes that aren't meaningful signal.

The design choice here was to resolve all of that in a dedicated normalization layer (`src/normalize/appIdentity.js`, `windowFilter.js`, `processFilters.js`, `windowSnapshotBuilder.js`) before anything reaches `sessionBuilder.js`. The session builder never sees a raw window or process record. It only ever sees a snapshot that's already been filtered down to valid, visible windows with a canonical `app_id`. That keeps `sessionBuilder.js` and `behaviorModel.js` simple: they can build sessions with a plain "is this app open or closed" state machine instead of also carrying filtering and identity-resolution logic.

The cost is granularity. Normalizing `chrome.exe` (however it's reported) down to a single `chrome` identity means every Chrome window, regardless of which site or tab has focus, collapses into one session. That's a deliberate tradeoff: for a tool meant to answer "how much of today was I actually in my editor versus my browser versus meetings," app-level identity is the right resolution. It would be the wrong choice for a tool trying to answer "which specific site did I spend time on," which would need the normalization layer to preserve more of the raw signal instead of discarding it early.
