import Ember from "ember";
export default Ember.Component.extend({
    tagName: 'div',
    classNames: ['container-fluid'],
    registerAs: null,
    actions: {
        hostCall: function() {
            return this.sendAction('hostCall');
        },
        joinCall: function(){
            return this.sendAction('joinCall');
        }
    },
    _register: function() {
        this.set('registerAs', this); // register-as is a new property
    }.on('init')
});