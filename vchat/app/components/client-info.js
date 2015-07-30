import Ember from "ember";
export default Ember.Component.extend({
    tagName: 'div',
    classNames: ['client-info'],
    registerAs: null,
    hostMode: false,
    hostPort: '9090',
    firstLocal: 'unknown',
    localAddresses: [],
    externalIp: 'unknown',
    connectedTo: 'unknown',
    didInsertElement : function () {
        Ember.run.scheduleOnce('afterRender', this, 'processChildElements');
    },
    processChildElements: function (){
        var button = this.$().find('button').first();
        var popup = this.$().find('.client-info-popup').first();
        var showing = false;
        popup.hide();
        button.click(function(){
            if(showing)
            {
                popup.stop().fadeOut('fast');
            }
            else
            {
                popup.stop().fadeIn('fast');
            }
            showing = !showing;
        });
    },
    _register: function() {
        var self = this;
        var nodeModules = this.get('nodeModules');
        this.set('registerAs', this); // register-as is a new property
        var os = nodeModules.get('os');
        var getIP = nodeModules.get('externalIp')();
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
        this.set('firstLocal', addresses.shift() + '');
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