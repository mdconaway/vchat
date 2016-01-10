module.exports = {
  appName: 'Video Chat',
  platforms: ['osx64', 'linux64', 'win64'],
  version: '0.12.3',
  macIcns: 'icons.icns',
  winIco: 'icon.ico',
  buildType: function() {
    return this.appVersion;
  }
};
