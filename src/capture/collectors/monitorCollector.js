const { screen } = require('electron');

async function collectMonitors() {
  const displays = screen.getAllDisplays();

  return displays.map((d, i) => ({
    monitor_id: i + 1,
    width: d.size.width,
    height: d.size.height,
  }));
}

module.exports = { collectMonitors };