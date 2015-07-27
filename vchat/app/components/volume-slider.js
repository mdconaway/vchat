import Ember from "ember";
export default Ember.Component.extend({
    tagName: 'section',
    registerAs: null,
    src: null,
    didInsertElement : function () {
        Ember.run.scheduleOnce('afterRender', this, 'processChildElements');
    },
    processChildElements: function(){
        var self = this;
        var slider  = this.$().find('.slider').first();
        var tooltip = this.$().find('.tooltip').first();
        var volume = this.$().find('.volume').first();
        var current = this.get('src').get('volume') * 100;
        
        tooltip.hide();
        
        slider.slider({
            range: "min",
            min: 0,
            max: 100,
            value: current,
            start: function(event,ui) {
                tooltip.stop().fadeIn('fast');
            },
            slide: function(event, ui) {
                var value  = slider.slider('value');
                self.get('src').set('volume', ui.value / 100);
                tooltip.css('left', value).text(ui.value);
                if(value <= 5) 
                {
                    volume.css('background-position', '0 0');
                } 
                else if (value <= 25) 
                {
                    volume.css('background-position', '0 -25px');
                } 
                else if (value <= 75) 
                {
                    volume.css('background-position', '0 -50px');
                } 
                else 
                {
                    volume.css('background-position', '0 -75px');
                };
            },
            stop: function(event,ui) {
                tooltip.stop().fadeOut('fast');
            }
        });
        tooltip.text(current+'').css('left', slider.slider('value'));
        this.$().on('mousedown', function(e){
            e.stopPropagation();
        }); //dont let this events past or else we will cause the grid to drag too
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