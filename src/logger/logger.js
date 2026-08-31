const fs = require('fs');
const path = require('path');
const { getBasePath } = require('../utils/paths');
const {
  LOG_PROCESSES,
  LOG_APP_SESSIONS,
  LOG_WINDOW_SNAPSHOTS,
} = require('../config/config');

const OVERWRITE_LOG = true;

let processLogPath;
let workspaceLogPath;
let appLogPath;

function shouldLogToConsole(event) {
  if (!event || !event.event_type) return false;

  if (event.event_type.startsWith('process_')) return LOG_PROCESSES;
  if (event.event_type.startsWith('app_') || event.event_type === 'baseline_app') {
    return LOG_APP_SESSIONS;
  }
  if (
    event.event_type === 'window_snapshot' ||
    event.event_type.startsWith('workspace_') ||
    event.event_type === 'focus_change'
  ) {
    return LOG_WINDOW_SNAPSHOTS;
  }

  return false;
}

function getLogPathForEvent(event) {
  if (!event || !event.event_type) return null;

  if (
    event.event_type === 'window_snapshot' ||
    event.event_type.startsWith('workspace_') ||
    event.event_type === 'focus_change'
  ) {
    return workspaceLogPath;
  }

  if (
    event.event_type.startsWith('app_') ||
    event.event_type === 'baseline_app'
  ) {
    return appLogPath;
  }

  return processLogPath;
}

function initializeLogFile(app) {
  const basePath = getBasePath(app);

  processLogPath = path.join(basePath, 'process_events.ndjson');
  workspaceLogPath = path.join(basePath, 'workspace_events.ndjson');
  appLogPath = path.join(basePath, 'app_events.ndjson');

  if (OVERWRITE_LOG) {
    fs.writeFileSync(processLogPath, '');
    fs.writeFileSync(workspaceLogPath, '');
    fs.writeFileSync(appLogPath, '');
  }

  console.log('Process logs:', processLogPath);
  console.log('Workspace logs:', workspaceLogPath);
  console.log('App logs:', appLogPath);

  writeEvent({
    event_type: 'session_start',
    timestamp: new Date().toISOString(),
  });
}

function writeEvent(event) {
  const logPath = getLogPathForEvent(event);
  if (!logPath) return;

  fs.appendFileSync(logPath, JSON.stringify(event) + '\n');

  if (shouldLogToConsole(event)) {
    console.log(event);
  }
}

module.exports = {
  initializeLogFile,
  writeEvent,
};