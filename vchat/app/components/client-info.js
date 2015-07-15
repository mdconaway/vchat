import Ember from "ember";
export default Ember.Component.extend({
    registerAs: null,
    hostMode: false,
    hostPort: '9090',
    localAddresses: [],
    externalIp: 'unknown',
    connectedTo: 'unknown',
    _register: function() {
        var self = this;
        this.set('registerAs', this); // register-as is a new property
        var os = require('os');
        var getIP = require('external-ip')();
        var interfaces = os.networkInterfaces();
        var addresses = [];
        for (var k in interfaces) {
            for (var k2 in interfaces[k]) {
                var address = interfaces[k][k2];
                if (address.family === 'IPv4' && !address.internal) {
                    addresses.push(address.address);
                }
            }
        }
        this.get('localAddresses').clear();
        this.get('localAddresses').pushObjects(addresses);
        getIP(function (err, ip) {
            if(err){
                // every service in the list has failed 
                throw err;
            }
            else
            {
                self.set('externalIp', ip);
            }
        });
    }.on('init')
});