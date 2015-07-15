import Ember from "ember";
export default Ember.View.extend({
    didInsertElement : function () {
        Ember.run.scheduleOnce('afterRender', this, 'processChildElements');
    },
    processChildElements: function (){
        var self = this;
        setTimeout(function(){
            self.$().find('.modal').first().addClass("in");
            self.$().find('.modal-backdrop').first().addClass("in");
        }, 10);
    }
});