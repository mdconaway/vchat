import Ember from "ember";
export default Ember.Component.extend({
    tagName: 'div',
    classNames: ["gridster", "width100"],
    registerAs: null,
    gridster: null,
    disable: false,
    src: [],
    didInsertElement : function () {
        Ember.run.scheduleOnce('afterRender', this, 'processChildElements');
    },
    willDestroyElement: function(){
        if(this.get('gridster') !== null)
        {
            this.get('gridster').destroy(false);
            this.set('gridster', null);
        }
        this.set('disable', true);
    },
    processChildElements: function (){
        if(!this.get('disable'))
        {
            if(this.get('gridster') !== null)
            {
                this.get('gridster').destroy(false);
                this.set('gridster', null);
            }
            this.set(
                'gridster', 
                this.$('ul').gridster({
                  widget_base_dimensions: [40, 30],
                  widget_margins: [4, 3],
                  autogrow_cols: true,
                  maintain_aspect_ratio: true,
                  resize: {
                    enabled: true
                  }
                }).data('gridster')
            );
        }
    },
    watcher: function(){
        Ember.run.later(this, this.processChildElements, 10);
    }.observes('src.@each'),
    _register: function() {
        this.set('registerAs', this); // register-as is a new property
    }.on('init')
});