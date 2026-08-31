const activeWin = require('active-win');
const path = require('path');
const { writeEvent } = require('../logger/logger');

let previousFocus = null;
let previousTimestamp = null;

function normalizeAppName(window) {
    if (window?.owner?.path) {
        return path.basename(window.owner.path);
    }

    if (window?.owner?.name) {
        return window.owner.name;
    }

    return 'unknown';
}

function getAppId(appName) {
    if (typeof appName !== 'string' || !appName.trim()) {
        return 'unknown';
    }

    return appName.replace(/\.exe$/i, '').toLowerCase().trim();
}

async function trackFocusChange() {
    try {
        const window = await activeWin();
        if (!window) return;

        const appName = normalizeAppName(window);
        const appId = getAppId(appName);

        const currentFocus = {
            app_name: appName,
            app_id: appId,
            pid: window.owner?.processId ?? null,
        };

        const timestamp = new Date().toISOString();

        if (!previousFocus) {
            previousFocus = currentFocus;
            previousTimestamp = Date.now();
            return;
        }

        const isSame = previousFocus.app_id === currentFocus.app_id;
        if (isSame) return;

        const duration = Date.now() - previousTimestamp;
        const safeTimestamp = timestamp.replace(/[:.]/g, '-');
        const fcid = `${safeTimestamp}_${previousFocus.app_id}_${currentFocus.app_id}`;

        const event = {
            event_type: 'focus_change',
            timestamp,
            fcid,
            previous_app: previousFocus.app_name,
            new_app: currentFocus.app_name,
            duration_ms: duration,
        };

        writeEvent(event);

        previousFocus = currentFocus;
        previousTimestamp = Date.now();
    } catch (err) {
        console.error('focus tracking error:', err);
    }
}

function startFocusTracker() {
    setInterval(trackFocusChange, 1000);
}

module.exports = {
    startFocusTracker,
};