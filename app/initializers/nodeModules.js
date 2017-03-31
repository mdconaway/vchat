import Ember from "ember";
export function initialize(application) {
    let modules = Ember.Object.create({
        externalIp: require('external-ip'),
        fs: require('fs'),
        https: require('https'),
        os: require('os'),
        path: require('path'),
        pem: require('pem'),
        socketIo: require('socket.io'),
        socketIoClient: require('socket.io-client')
    });
    application.register('services:nodeModules', modules, {instantiate: false});
    application.inject('route', 'nodeModules', 'services:nodeModules');
    application.inject('controller', 'nodeModules', 'services:nodeModules');
    application.inject('component', 'nodeModules', 'services:nodeModules');
    application.inject('view', 'nodeModules', 'services:nodeModules');
}

export default {
  name: 'nodeModules',
  initialize: initialize
};