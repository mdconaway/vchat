import Ember from "ember";
const { Component, run } = Ember;

export default Component.extend({
    tagName: 'div',
    classNames: ['container-fluid'],
    registerAs: null,
    didInsertElement : function () {
        run.scheduleOnce('afterRender', this, '_register');
    },
    _register: function() {
        this.set('registerAs', this); // register-as is a new property
    }
});