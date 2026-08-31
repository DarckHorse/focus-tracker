const { loadRawTelemetry } = require("./behaviorAdapter");
const {
  buildWorkspaceSessions,
  buildBackgroundSessions,
} = require("./sessionBuilder");

const PERSISTENT_APPS = new Set(["explorer.exe"]);

function normalizeAppName(name) {
  return (name || "").toLowerCase().trim();
}

function getWorkspaceSnapshots(workspaceEvents) {
  return workspaceEvents.filter(
    (event) => event.event_type === "window_snapshot"
  );
}

function getLastSnapshot(windowSnapshots) {
  if (!windowSnapshots.length) return null;
  return windowSnapshots[windowSnapshots.length - 1];
}

function getVisibleApps(snapshot) {
  if (!snapshot) return [];

  return [
    ...new Set(
      (snapshot.windows || [])
        .filter((w) => !w.is_minimized)
        .map((w) => normalizeAppName(w.app_name))
        .filter(Boolean)
    ),
  ];
}

function diffVisibleApps(prevSnapshot, nextSnapshot) {
  const prevApps = new Set(getVisibleApps(prevSnapshot));
  const nextApps = new Set(getVisibleApps(nextSnapshot));
  const timestamp = nextSnapshot?.timestamp;

  const events = [];

  for (const app of nextApps) {
    if (!prevApps.has(app)) {
      events.push({
        timestamp,
        type: "app_entered_workspace",
        app,
      });
    }
  }

  for (const app of prevApps) {
    if (!nextApps.has(app)) {
      events.push({
        timestamp,
        type: "app_left_workspace",
        app,
      });
    }
  }

  if (events.length > 0) {
    events.push({
      timestamp,
      type: "workspace_changed",
    });
  }

  return events;
}

function buildWorkspaceFeed(windowSnapshots) {
  const feed = [];

  for (let i = 1; i < windowSnapshots.length; i += 1) {
    feed.push(...diffVisibleApps(windowSnapshots[i - 1], windowSnapshots[i]));
  }

  return feed;
}

function buildAppFeed(appEvents) {
  return appEvents
    .filter(
      (event) =>
        event.event_type === "app_start" ||
        event.event_type === "app_stop"
    )
    .map((event) => ({
      timestamp: event.timestamp,
      type: event.event_type,
      app: normalizeAppName(event.app_name),
      duration_ms: event.duration_ms ?? null,
    }));
}

function buildEventFeed(appEvents, windowSnapshots) {
  return [...buildAppFeed(appEvents), ...buildWorkspaceFeed(windowSnapshots)]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 50);
}

function buildBehaviorModel() {
  const { appEvents, workspaceEvents } = loadRawTelemetry();
  const windowSnapshots = getWorkspaceSnapshots(workspaceEvents);
  const lastSnapshot = getLastSnapshot(windowSnapshots);

  const visibleApps = new Set(getVisibleApps(lastSnapshot));

  const workspace = [...visibleApps].filter(
    (app) => !PERSISTENT_APPS.has(app)
  );

  const persistent = [...visibleApps].filter((app) =>
    PERSISTENT_APPS.has(app)
  );

  const appState = new Map();

  for (const event of appEvents) {
    const app = normalizeAppName(event.app_name);
    if (!app) continue;

    if (
      event.event_type === "baseline_app" ||
      event.event_type === "app_start"
    ) {
      appState.set(app, true);
    }

    if (event.event_type === "app_stop") {
      appState.delete(app);
    }
  }

  const background = [...appState.keys()].filter(
    (app) => !visibleApps.has(app) && !PERSISTENT_APPS.has(app)
  );

  return {
    currentState: {
      workspace,
      background,
      persistent,
    },
    eventFeed: buildEventFeed(appEvents, windowSnapshots),
    sessions: [
      ...buildWorkspaceSessions(windowSnapshots),
      ...buildBackgroundSessions(appEvents),
    ],
  };
}

module.exports = {
  buildBehaviorModel,
};