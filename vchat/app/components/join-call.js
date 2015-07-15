import Ember from "ember";
export default Ember.Component.extend({
    registerAs: null,
    joinAddress: '',
    joinPort: '',
    actions: {
        connect: function() {
            return this.sendAction('connect');
        },
        choose: function(){
            return this.sendAction('choose');
        }
    },
    didInsertElement : function () {
        Ember.run.scheduleOnce('afterRender', this, 'processChildElements');
    },
    processChildElements: function (){
        var self = this;
        setTimeout(function(){
            self.$().find('input').first().focus();
        }, 10);
    },
    _register: function() {
        this.set('registerAs', this); // register-as is a new property
    }.on('init')
});