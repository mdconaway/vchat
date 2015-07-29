import Ember from "ember";
export default Ember.Component.extend({
    tagName: 'div',
    classNames: ['effect-chooser', 'pointer'],
    registerAs: null,
    src: null,
    choose: false,
    actions:{
        
    },
    didInsertElement : function () {
        Ember.run.scheduleOnce('afterRender', this, 'processChildElements');
    },
    processChildElements: function (){
        var self = this;
        var src = this.get('src');
        var effect = src.get('effect');
        var tooltip = this.$().find('.tooltip').first();
        var color = this.$().find('.effect-icon-color').first();
        var grey = this.$().find('.effect-icon-grey').first();
        var sepia = this.$().find('.effect-icon-sepia').first();
        var abstract = this.$().find('.effect-icon-abstract').first();
        var t1 = '2px';
        var t2 = '45px';
        
        color.click(function(){
            if(self.get('choose'))
            {
                src.set('effect', 'color');
                grey.stop().fadeOut('fast');
                sepia.stop().fadeOut('fast');
                abstract.stop().fadeOut('fast');
                tooltip.css({top: t1});
                self.set('choose', false);
            }
            else
            {
                grey.stop().fadeIn('fast');
                sepia.stop().fadeIn('fast');
                abstract.stop().fadeIn('fast');
                tooltip.css({top: t2});
                self.set('choose', true);
            }
        });
        grey.click(function(){
            if(self.get('choose'))
            {
                src.set('effect', 'grey');
                color.stop().fadeOut('fast');
                sepia.stop().fadeOut('fast');
                abstract.stop().fadeOut('fast');
                tooltip.css({top: t1});
                self.set('choose', false);
            }
            else
            {
                color.stop().fadeIn('fast');
                sepia.stop().fadeIn('fast');
                abstract.stop().fadeIn('fast');
                tooltip.css({top: t2});
                self.set('choose', true);
            }
        });
        sepia.click(function(){
            if(self.get('choose'))
            {
                src.set('effect', 'sepia');
                grey.stop().fadeOut('fast');
                color.stop().fadeOut('fast');
                abstract.stop().fadeOut('fast');
                tooltip.css({top: t1});
                self.set('choose', false);
            }
            else
            {
                grey.stop().fadeIn('fast');
                color.stop().fadeIn('fast');
                abstract.stop().fadeIn('fast');
                tooltip.css({top: t2});
                self.set('choose', true);
            }
        });
        abstract.click(function(){
            if(self.get('choose'))
            {
                src.set('effect', 'abstract');
                grey.stop().fadeOut('fast');
                color.stop().fadeOut('fast');
                sepia.stop().fadeOut('fast');
                tooltip.css({top: t1});
                self.set('choose', false);
            }
            else
            {
                grey.stop().fadeIn('fast');
                color.stop().fadeIn('fast');
                sepia.stop().fadeIn('fast');
                tooltip.css({top: t2});
                self.set('choose', true);
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
    }.on('init')
});