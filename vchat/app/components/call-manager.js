import Ember from "ember";
export default Ember.Component.extend({
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
    _register: function() {
        this.set('registerAs', this); // register-as is a new property
    }.on('init')
});