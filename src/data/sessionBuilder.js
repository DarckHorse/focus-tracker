function normalizeAppName(name) {
  return (name || "").toLowerCase().trim();
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

function buildWorkspaceSessions(windowSnapshots) {
  const openSessions = new Map();
  const sessions = [];

  for (const snapshot of windowSnapshots) {
    const timestamp = snapshot.timestamp;
    const visibleApps = new Set(getVisibleApps(snapshot));

    for (const app of visibleApps) {
      if (!openSessions.has(app)) {
        openSessions.set(app, {
          app,
          lane: "workspace",
          start: timestamp,
        });
      }
    }

    for (const [app, session] of openSessions.entries()) {
      if (!visibleApps.has(app)) {
        sessions.push({
          ...session,
          end: timestamp,
        });
        openSessions.delete(app);
      }
    }
  }

  const lastTimestamp = windowSnapshots.at(-1)?.timestamp;

  for (const session of openSessions.values()) {
    sessions.push({
      ...session,
      end: lastTimestamp,
    });
  }

  return sessions.filter((s) => s.start && s.end);
}

function buildBackgroundSessions(appEvents) {
  const openSessions = new Map();
  const sessions = [];

  for (const event of appEvents) {
    const app = normalizeAppName(event.app_name);
    if (!app) continue;

    const timestamp = event.timestamp;

    if (
      event.event_type === "baseline_app" ||
      event.event_type === "app_start"
    ) {
      if (!openSessions.has(app)) {
        openSessions.set(app, {
          app,
          lane: "background",
          start: timestamp,
        });
      }
    }

    if (event.event_type === "app_stop") {
      const session = openSessions.get(app);
      if (session) {
        sessions.push({
          ...session,
          end: timestamp,
        });
        openSessions.delete(app);
      }
    }
  }

  const lastTimestamp = appEvents.at(-1)?.timestamp;

  for (const session of openSessions.values()) {
    sessions.push({
      ...session,
      end: lastTimestamp,
    });
  }

  return sessions.filter((s) => s.start && s.end);
}

module.exports = {
  buildWorkspaceSessions,
  buildBackgroundSessions,
};