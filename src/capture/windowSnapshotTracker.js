const { buildWindowSnapshot } = require("../normalize/windowSnapshotBuilder");
const { writeEvent } = require("../logger/logger");
const { collectWindows } = require("./collectors/windowCollector");
const { collectMonitors } = require("./collectors/monitorCollector");
const { WINDOW_SNAPSHOT_INTERVAL_MS } = require("../config/config");

async function captureWindowSnapshot({
  timestamp = new Date().toISOString(),
} = {}) {
  const rawWindows = await collectWindows();
  const rawMonitors = await collectMonitors();

  const snapshot = buildWindowSnapshot({
    timestamp,
    rawWindows,
    rawMonitors,
  });

  writeEvent(snapshot);
  return snapshot;
}

function startWindowSnapshotTracker() {
  captureWindowSnapshot().catch((error) => {
    console.error("Initial window snapshot capture failed:", error);
  });

  setInterval(() => {
    captureWindowSnapshot().catch((error) => {
      console.error("Window snapshot capture failed:", error);
    });
  }, WINDOW_SNAPSHOT_INTERVAL_MS);
}

module.exports = {
  captureWindowSnapshot,
  startWindowSnapshotTracker,
};