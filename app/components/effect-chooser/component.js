import Ember from "ember";
const { Component, run } = Ember;

export default Component.extend({
    tagName: 'div',
    classNames: ['effect-chooser', 'pointer'],
    registerAs: null,
    src: null,
    choose: false,
    actions:{
        
    },
    didInsertElement : function () {
        run.scheduleOnce('afterRender', this, 'processChildElements');
    },
    processChildElements: function (){
        let src = this.get('src');
        let effect = src.get('effect');
        let tooltip = this.$().find('.tooltip').first();
        let color = this.$().find('.effect-icon-color').first();
        let grey = this.$().find('.effect-icon-grey').first();
        let sepia = this.$().find('.effect-icon-sepia').first();
        let abstract = this.$().find('.effect-icon-abstract').first();
        let t1 = '2px';
        let t2 = '45px';
        this._register();
        color.click(() => {
            if(this.get('choose'))
            {
                src.set('effect', 'color');
                grey.stop().fadeOut('fast');
                sepia.stop().fadeOut('fast');
                abstract.stop().fadeOut('fast');
                tooltip.css({top: t1});
                this.set('choose', false);
            }
            else
            {
                grey.stop().fadeIn('fast');
                sepia.stop().fadeIn('fast');
                abstract.stop().fadeIn('fast');
                tooltip.css({top: t2});
                this.set('choose', true);
            }
        });
        grey.click(() => {
            if(this.get('choose'))
            {
                src.set('effect', 'grey');
                color.stop().fadeOut('fast');
                sepia.stop().fadeOut('fast');
                abstract.stop().fadeOut('fast');
                tooltip.css({top: t1});
                this.set('choose', false);
            }
            else
            {
                color.stop().fadeIn('fast');
                sepia.stop().fadeIn('fast');
                abstract.stop().fadeIn('fast');
                tooltip.css({top: t2});
                this.set('choose', true);
            }
        });
        sepia.click(() => {
            if(this.get('choose'))
            {
                src.set('effect', 'sepia');
                grey.stop().fadeOut('fast');
                color.stop().fadeOut('fast');
                abstract.stop().fadeOut('fast');
                tooltip.css({top: t1});
                this.set('choose', false);
            }
            else
            {
                grey.stop().fadeIn('fast');
                color.stop().fadeIn('fast');
                abstract.stop().fadeIn('fast');
                tooltip.css({top: t2});
                this.set('choose', true);
            }
        });
        abstract.click(() => {
            if(this.get('choose'))
            {
                src.set('effect', 'abstract');
                grey.stop().fadeOut('fast');
                color.stop().fadeOut('fast');
                sepia.stop().fadeOut('fast');
                tooltip.css({top: t1});
                this.set('choose', false);
            }
            else
            {
                grey.stop().fadeIn('fast');
                color.stop().fadeIn('fast');
                sepia.stop().fadeIn('fast');
                tooltip.css({top: t2});
                this.set('choose', true);
            }
        });
        grey.hide();
        sepia.hide();
        color.hide();
        abstract.hide();
        if(effect === 'color')
        {
            color.show();
        }
        else if(effect === 'grey')
        {
            grey.show();
        }
        else if(effect === 'sepia')
        {
            sepia.show();
        }
        else if(effect === 'abstract')
        {
            abstract.show();
        }
        tooltip.hide();
        this.$().hover(() => {
            tooltip.stop().show();
        }, () => {
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