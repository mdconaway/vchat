import Ember from "ember";
const { Component, run } = Ember;

export default Component.extend({
    tagName: 'div',
    classNames: ['snapshot-button', 'pointer'],
    actions:{
        snapshot: function(){
            this.sendAction('snapshot');
        }
    },
    didInsertElement : function () {
        run.scheduleOnce('afterRender', this, 'processChildElements');
    },
    processChildElements: function (){
        let tooltip = this.$().find('.tooltip').first();
        this._register();
        tooltip.hide();
        this.$().hover(function(){
            tooltip.stop().show();
        }, function(){
            tooltip.stop().hide();
        });
    },
    hide: function(){
        this.$().stop().fadeOut('fast');
    },
    show: function(){
        this.$().stop().fadeIn('fast');
    },
    _register: function() {
        this.set('registerAs', this); // register-as is a new property
    }
});