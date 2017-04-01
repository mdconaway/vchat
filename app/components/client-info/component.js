import Ember from "ember";
const { Component, inject, run } = Ember;

export default Component.extend({
    tagName: 'div',
    classNames: ['client-info'],
    nodeModules: inject.service(),
    registerAs: null,
    hostMode: false,
    hostPort: '9090',
    firstLocal: 'unknown',
    localAddresses: [],
    externalIp: 'unknown',
    connectedTo: 'unknown',
    didInsertElement : function () {
        run.scheduleOnce('afterRender', this, 'processChildElements');
    },
    processChildElements: function (){
        let button = this.$().find('button').first();
        let popup = this.$().find('.client-info-popup').first();
        let showing = false;
        this._register();
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
        let nodeModules = this.get('nodeModules');
        this.set('registerAs', this); // register-as is a new property
        let os = nodeModules.get('os');
        let getIP = nodeModules.get('externalIp')();
        let interfaces = os.networkInterfaces();
        let addresses = [];
        Object.keys(interfaces).forEach((k) => {
            Object.keys(interfaces[k]).forEach((k2) => {
                let address = interfaces[k][k2];
                if(address.family === 'IPv4' && !address.internal) 
                {
                    addresses.push(address.address);
                }
            });
        });
        this.set('firstLocal', addresses.shift() + '');
        this.get('localAddresses').clear();
        this.get('localAddresses').pushObjects(addresses);
        getIP((err, ip) => {
            if(err)
            {
                // every service in the list has failed 
                throw err;
            }
            else
            {
                this.set('externalIp', ip);
            }
        });
    }
});