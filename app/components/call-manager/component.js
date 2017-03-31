import Ember from "ember";
const { Component, run } = Ember;

export default Component.extend({
    tagName: 'div',
    classNames: ['container-fluid', 'call-manager'],
    registerAs: null,
    connectedTo: 'unknown',
    hostMode: false,
    hostPort: '9090',
    actions: {
        disconnect: function() {
            return this.sendAction('disconnect');
        }
    },
    didInsertElement : function () {
        run.scheduleOnce('afterRender', this, '_register');
    },
    _register: function() {
        this.set('registerAs', this); // register-as is a new property
    }
});