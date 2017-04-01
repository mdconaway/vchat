module.exports = {
  appName: 'Video Chat',
  platforms: ['linux64', 'win64', 'osx64'],
  version: '0.21.4',
  macIcns: 'icons.icns',
  winIco: 'icon.ico',
  flavor: 'normal',
  buildType: function() {
    return this.appVersion;
  }
};
