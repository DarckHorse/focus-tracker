const os = require('os');

const CONFIG = {
  meta: {
    os: 'windows',
    edition: 'Windows 11',
    version_label: '25H2',
    build: os.release(),
  },

  ignored: new Set([
    'conhost.exe',
    'svchost.exe',
    'rundll32.exe',
    'RuntimeBroker.exe',
    'dllhost.exe',
    'backgroundTaskHost.exe',
    'WmiPrvSE.exe',
    'audiodg.exe',
    'fastlist-0.3.0-x64.exe',
    'LockApp.exe',
    'ShellExperienceHost.exe',
    'StartMenuExperienceHost.exe',
    'SearchHost.exe',
    'ApplicationFrameHost.exe',
  ]),
};

module.exports = CONFIG;