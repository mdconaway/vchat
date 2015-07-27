import Ember from "ember";
export default Ember.Controller.extend({
    actions: {
        close: function(){
            this.send('closeModal');
        },
        confirm: function(){
            this.send('disconnectSocket', this.get('model'));
            this.send('closeModal');
        }
    }
});