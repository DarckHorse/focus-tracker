const { writeEvent } = require('../logger/logger');
const { DEBUG } = require('../config/config');

let previousAppCounts = new Map();
let appSessionStartTimes = new Map();

function buildCurrentAppCounts(currentProcesses) {
  const currentAppCounts = new Map();

  currentProcesses.forEach((appName) => {
    const currentCount = currentAppCounts.get(appName) || 0;
    currentAppCounts.set(appName, currentCount + 1);
  });

  return currentAppCounts;
}

function handleAppStarts(currentAppCounts, timestamp, isFirstRun) {
  currentAppCounts.forEach((pidCount, appName) => {
    const previousCount = previousAppCounts.get(appName) || 0;

    if (previousCount > 0) return;
    if (isFirstRun) return;

    appSessionStartTimes.set(appName, Date.now());

    const event = {
      event_type: 'app_start',
      timestamp,
      app_name: appName,
      pid_count: pidCount,
    };

    if (DEBUG) console.log(event);
    writeEvent(event);
  });
}

function handleAppStops(currentAppCounts, timestamp) {
  previousAppCounts.forEach((previousCount, appName) => {
    const currentCount = currentAppCounts.get(appName) || 0;

    if (currentCount > 0) return;

    const startTime = appSessionStartTimes.get(appName);
    const duration = startTime ? Date.now() - startTime : null;

    const event = {
      event_type: 'app_stop',
      timestamp,
      app_name: appName,
      duration_ms: duration,
      pid_count: 0,
    };

    writeEvent(event);

    appSessionStartTimes.delete(appName);
  });
}

function trackAppSessions(currentProcesses, timestamp, isFirstRun) {
  const currentAppCounts = buildCurrentAppCounts(currentProcesses);

  handleAppStarts(currentAppCounts, timestamp, isFirstRun);
  handleAppStops(currentAppCounts, timestamp);

  previousAppCounts = currentAppCounts;
}

module.exports = {
  trackAppSessions,
};