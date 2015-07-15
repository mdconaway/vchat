import Ember from "ember";
export default Ember.Component.extend({
    registerAs: null,
    actions: {
        disconnect: function() {
            return this.sendAction('disconnect');
        }
    },
    _register: function() {
        this.set('registerAs', this); // register-as is a new property
    }.on('init')
});