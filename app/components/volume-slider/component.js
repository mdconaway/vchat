import Ember from "ember";
const { Component, run } = Ember;

export default Component.extend({
    tagName: 'section',
    registerAs: null,
    src: null,
    didInsertElement : function () {
        run.scheduleOnce('afterRender', this, 'processChildElements');
    },
    processChildElements: function(){
        let slider  = this.$().find('.slider').first();
        let tooltip = this.$().find('.tooltip').first();
        let volume = this.$().find('.volume').first();
        let current = this.get('src').get('volume') * 100;
        let adjustVolume = (value) => {
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
            }
        };

        this._register();
        tooltip.hide();
        
        slider.slider({
            range: "min",
            min: 0,
            max: 100,
            value: current,
            start: () => { //event,ui available if needed
                tooltip.stop().fadeIn('fast');
            },
            slide: (event, ui) => {
                let value  = slider.slider('value');
                this.get('src').set('volume', ui.value / 100);
                tooltip.css('left', value).text(ui.value);
                adjustVolume(value);
            },
            stop: () => {  //event,ui available if needed
                tooltip.stop().fadeOut('fast');
            }
        });
        tooltip.text(current+'').css('left', slider.slider('value'));
        adjustVolume(slider.slider('value'));
        this.$().on('mousedown', (e) => {
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
    }
});