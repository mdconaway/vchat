module.exports = {
  appName: 'Video Chat',
  platforms: ['osx64', 'linux64', 'win64'],
  version: '0.21.4',
  macIcns: 'icons.icns',
  winIco: 'icon.ico',
  buildType: function() {
    return this.appVersion;
  }
};
