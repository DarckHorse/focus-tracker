const fs = require("fs");
const path = require("path");

function parse(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  return raw
    .split("\n")
    .filter(Boolean)
    .map(JSON.parse);
}

function loadRawTelemetry() {
  const base = path.resolve(__dirname, "../../");

  return {
    processEvents: parse(path.join(base, "process_events.ndjson")),
    appEvents: parse(path.join(base, "app_events.ndjson")),
    workspaceEvents: parse(path.join(base, "workspace_events.ndjson")),
  };
}

module.exports = {
  loadRawTelemetry,
};