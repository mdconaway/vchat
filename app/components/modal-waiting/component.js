import Ember from "ember";
import FadeIn from "vchat/mixins/fade-in";
const { Component, run } = Ember;

export default Component.extend(FadeIn, {
    didInsertElement : function () {
        run.scheduleOnce('afterRender', this, 'processChildElements');
    },
    processChildElements: function (){
        run.later(() => {
            this.fadeIn();
        }, 10);
    },
    actions: {
        close: function(){
            this.sendAction('closeModal');
        }
    }
});