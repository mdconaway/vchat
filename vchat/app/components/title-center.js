import Ember from "ember";
export default Ember.Component.extend({
    tagName: 'div',
    classNames: ['container-fluid'],
    registerAs: null,
    _register: function() {
        this.set('registerAs', this); // register-as is a new property
    }.on('init')
});