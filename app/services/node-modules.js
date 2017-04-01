import Ember from 'ember';
const { Service, inject } = Ember;

export default Service.extend({
    debug: inject.service(),
    init: function(){
        this._super();
        try
        {
            this.setProperties({
                externalIp: require('external-ip'),
                fs: require('fs'),
                https: require('https'),
                os: require('os'),
                path: require('path'),
                pem: require('pem'),
                socketIo: require('socket.io'),
                socketIoClient: require('socket.io-client')
            });
        }
        catch(error)
        {
            alert(error);
            this.get('debug').error(error);
        }
    }
});