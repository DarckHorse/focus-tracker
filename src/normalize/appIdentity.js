const path = require('path');

function getRawAppName(processOrWindow) {
  if (processOrWindow?.owner?.path) {
    return path.basename(processOrWindow.owner.path);
  }

  if (processOrWindow?.owner?.name) {
    return processOrWindow.owner.name;
  }

  if (processOrWindow?.name) {
    return processOrWindow.name;
  }

  return 'unknown';
}

function normalizeAppName(input) {
  const rawName =
    typeof input === 'string' ? input : getRawAppName(input);

  return rawName.trim();
}

function getAppId(input) {
  return normalizeAppName(input).replace(/\.exe$/i, '').toLowerCase();
}

module.exports = {
  normalizeAppName,
  getAppId,
};