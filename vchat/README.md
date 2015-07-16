# Video Chat

A program by: Michael Conaway

A standalone peer to peer video chat application written with Ember.js and NW.js.

This application does not require an external signaling server, it IS the signaling server as well as the video client.

(For now, it will auto-negotiate data-streams using public STUN servers.  A future improvement is to implement STUN within the app as well.)

To Host: Simply click the "Host Conversation" button, and tell the app which port to listen on.  Please note, that as a host you must setup port forwarding on your router to allow outside connections to make contact and setup a P2P stream share.

To Join: Simply click the "Join Conversation" button and dial-in to the host's external IP and listening port.

* This application is stored for development within the NetBeans IDE.  All source code is within the vchat folder.

## Prerequisites

You will need the following things properly installed on your computer to develop or build this application:

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)
* [Bower](http://bower.io/)
* [Ember CLI](http://www.ember-cli.com/)
* [PhantomJS](http://phantomjs.org/)
* [Testem](https://github.com/airportyh/testem/)

## Development Setup

* `git clone <repository-url>` this repository
*  change into the vchat directory
* `npm install`
* `bower install`

## Running / Development

* `ember nw`
* This will build and launch the app in node-webkit (NW.js).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember nw:test`
  * This will build and test the app exclusively in node-webkit (NW.js).

* `ember nw:test --server`
  * This will build and test the app in node-webkit (NW.js) as well as in ember's server mode.

### Building

* `ember nw:package` (defaults to production)
* `ember nw:package --environment development` (dev releases)

### Deploying

Running 'ember nw:package' will produce a standalone application within the build folder.
Currently, builds are added to the folder using path `<version>/<os type>/<app>`.

### Special Thanks
* Ember.js Team [http://emberjs.com]
* Node.js Team [https://nodejs.org]
* Gridster.js Team [http://gridster.net/]
* Uri.js Team [http://medialize.github.io/URI.js/]
* Bootstrap Team [http://getbootstrap.com/]
* Load Awesome CSS Team [http://github.danielcardoso.net/load-awesome/]
* brzpegasus [https://github.com/brzpegasus/ember-cli-node-webkit]

## Further Reading / Useful Links

* [ember.js](http://emberjs.com/)
* [ember-cli](http://www.ember-cli.com/)
* [ember-cli-node-webkit](https://github.com/brzpegasus/ember-cli-node-webkit/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)

* STUN server to allow the app to run it's own NAT breakthrough
  * https://github.com/enobufs/stun

* For using the app without a private STUN server
  * http://stackoverflow.com/questions/20068944/webrtc-stun-stun-l-google-com19302

* STUN list
  * http://olegh.ftp.sh/public-stun.txt

* WebRTC info
  * http://blog.mgechev.com/2014/12/26/multi-user-video-conference-webrtc-angularjs-yeoman/