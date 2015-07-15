module.exports = {
  appName: 'Video Chat',
  platforms: ['osx64'],//, 'win64'],
  macIcns: 'icons.icns',
  winIco: 'icon.ico',
  buildType: function() {
    return this.appVersion;
  }
};