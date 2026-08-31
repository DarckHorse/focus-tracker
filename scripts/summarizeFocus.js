const fs = require('fs');
const path = require('path');
const { getBasePath } = require('../utils/paths');

const MIN_DURATION_MS = 0; // filter out noise (<5s)

function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
}

function displayName(app) {
    return app.replace(/\.exe$/i, '');
}

function readNdjson(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`Log file not found: ${filePath}`);
    }

    const raw = fs.readFileSync(filePath, 'utf8');

    return raw
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            try {
                return JSON.parse(line);
            } catch {
                return null;
            }
        })
        .filter(Boolean);
}

function summarizeFocusEvents(events) {
    const totals = new Map();

    events.forEach((event) => {
        if (event.event_type !== 'focus_change') return;
        if (!event.previous_app) return;
        if (typeof event.duration_ms !== 'number') return;
        if (event.duration_ms < MIN_DURATION_MS) return; // noise filter

        const currentTotal = totals.get(event.previous_app) || 0;
        totals.set(event.previous_app, currentTotal + event.duration_ms);
    });

    return [...totals.entries()]
        .map(([appName, durationMs]) => ({
            app_name: appName,
            duration_ms: durationMs,
        }))
        .sort((a, b) => b.duration_ms - a.duration_ms);
}

function printSummary(summary) {
    console.log('\nFocus Summary\n');

    if (summary.length === 0) {
        console.log('No meaningful focus data.\n');
        return;
    }

    summary.forEach((item) => {
        const paddedName = displayName(item.app_name).padEnd(20, ' ');
        console.log(`${paddedName} ${formatDuration(item.duration_ms)}`);
    });

    const grandTotal = summary.reduce((sum, item) => sum + item.duration_ms, 0);
    console.log(`\nTotal tracked focus time: ${formatDuration(grandTotal)}\n`);
}

function main() {
    const basePath = getBasePath({ getPath: () => '' });
    const logFilePath = path.join(basePath, 'process_events.ndjson');

    const events = readNdjson(logFilePath);
    const summary = summarizeFocusEvents(events);
    printSummary(summary);
}

main();