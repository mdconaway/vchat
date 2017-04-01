import Ember from 'ember';
const { Service, inject } = Ember;

export default Service.extend({
    debug: inject.service(),
    init: function(){
        const nodeRequire = window.require;
        this._super();
        try
        {
            this.setProperties({
                externalIp: nodeRequire('external-ip'),
                fs: nodeRequire('fs'),
                https: nodeRequire('https'),
                os: nodeRequire('os'),
                path: nodeRequire('path'),
                pem: nodeRequire('pem'),
                socketIo: nodeRequire('socket.io'),
                socketIoClient: nodeRequire('socket.io-client')
            });
        }
        catch(error)
        {
            this.get('debug').error(error);
        }
    }
});