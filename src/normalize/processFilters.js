const os = require('os');

function loadIgnoredProcesses() {
  const platform = os.platform();

  let config;

  if (platform === 'win32') {
    config = require('../config/ignoredProcesses.windows');
  } else if (platform === 'darwin') {
    config = require('../config/ignoredProcesses.mac');
  } else if (platform === 'linux') {
    config = require('../config/ignoredProcesses.linux');
  } else {
    return new Set();
  }

  console.log('Loaded ignore config:', config.meta);
  return config.ignored;
}

const IGNORED_PROCESSES = loadIgnoredProcesses();

function shouldIgnoreProcess(processName) {
  return IGNORED_PROCESSES.has(processName);
}

module.exports = {
  shouldIgnoreProcess,
};