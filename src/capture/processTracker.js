const psList = require('ps-list').default;
const { initializeLogFile, writeEvent } = require('../logger/logger');
const { shouldIgnoreProcess } = require('../normalize/processFilters');
const { POLL_INTERVAL_MS, DEBUG } = require('../config/config');
const { trackAppSessions } = require('./appSessionTracker');

let previousProcesses = new Map();
let processStartTimes = new Map();
let isFirstRun = true;

function buildCurrentProcesses(processes) {
  const currentProcesses = new Map();

  processes.forEach((p) => {
    if (shouldIgnoreProcess(p.name)) return;
    currentProcesses.set(p.pid, p.name);
  });

  return currentProcesses;
}

function handleProcessStarts(currentProcesses, timestamp) {
  currentProcesses.forEach((name, pid) => {
    if (previousProcesses.has(pid)) return;

    if (!isFirstRun) {
      processStartTimes.set(pid, Date.now());

      const event = {
        event_type: 'process_start',
        timestamp,
        pid,
        process_name: name,
      };

      writeEvent(event);
    }
  });
}

function handleProcessStops(currentProcesses, timestamp) {
  previousProcesses.forEach((name, pid) => {
    if (currentProcesses.has(pid)) return;

    const startTime = processStartTimes.get(pid);
    const duration = startTime ? Date.now() - startTime : null;

    const event = {
      event_type: 'process_stop',
      timestamp,
      pid,
      process_name: name,
      duration_ms: duration,
    };

    if (DEBUG) console.log(event);
    writeEvent(event);

    processStartTimes.delete(pid);
  });
}

function startProcessTracker(app) {

  setInterval(async () => {
    try {
      const processes = await psList();
      const timestamp = new Date().toISOString();

      const currentProcesses = buildCurrentProcesses(processes);

      handleProcessStarts(currentProcesses, timestamp);
      handleProcessStops(currentProcesses, timestamp);

      trackAppSessions(currentProcesses, timestamp, isFirstRun);

      if (isFirstRun) {
        const appSet = new Set();

        currentProcesses.forEach((name) => {
          appSet.add(name);
        });

        appSet.forEach((appName) => {
          writeEvent({
            event_type: 'baseline_app',
            timestamp,
            app_name: appName,
          });
        });
      }

      isFirstRun = false;
      previousProcesses = currentProcesses;
    } catch (error) {
      console.error('process polling error:', error);
    }
  }, POLL_INTERVAL_MS);
}

module.exports = {
  startProcessTracker,
};