/* global require, module */
var funnel = require('broccoli-funnel');  
var mergeTrees  = require('broccoli-merge-trees');  
var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var isTesting = EmberApp.env() === 'test';
var isDev = EmberApp.env() === 'development';
var app;

if(isTesting || isDev){
    app = new EmberApp({
        minifyCSS: {
          enabled: false
        },
        minifyJS: {
          enabled: false
        },
        sourcemaps: {
          enabled: false
        }
    });
}
else
{
    app = new EmberApp({
        fingerprint: {
            exclude: ['img']
        },
        minifyCSS: {
          enabled: true
        },
        minifyJS: {
          enabled: true
        },
        sourcemaps: {
          enabled: false
        }
    });
}

app.import('vendor/css/jquery-ui.min.css');
app.import('vendor/css/bootstrap.min.css');

app.import('vendor/lib/jquery-ui.js');
app.import('vendor/lib/uri.js');

// Use `app.import` to add additional libraries to the generated
// output files.
//
// If you need to use different assets in different
// environments, specify an object as the first parameter. That
// object's keys should be the environment name and the values
// should be the asset to use in that environment.
//
// If the library that you are including contains AMD or ES6
// modules that you would like to import into your application
// please specify an object with the list of modules as keys
// along with the exports of each module as its value.
var vendorimage = funnel('vendor/css', {
    srcDir: '/',
    include: ['images/*'],
    destDir: '/assets'
});

module.exports = mergeTrees([vendorimage, app.toTree()]);//app.toTree();
