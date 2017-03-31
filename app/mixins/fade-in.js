import Ember from 'ember';
const { Mixin } = Ember;

export default Mixin.create({
    fadeIn: function(){
        if(!this.isDestroyed && !this.isDestroying)
        {
            let submit = this.$().find('.modal-submit').first();
            this.$().find('.modal').first().addClass("in");
            this.$().find('.modal-backdrop').first().addClass("in");
            if(submit)
            {
                submit.focus();
            }
        }
    }
});