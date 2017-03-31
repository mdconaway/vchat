import Ember from "ember";
const { Route } = Ember;

export default Route.extend({
    actions: {
        disconnectSocket: function(el){
            this.controller.disconnectSocket(el);
        },
        hostServer: function(port){
            this.controller.listen(port);
        },
        endHosting: function(){
            this.controller.stopListening();
        },
        openModal: function(modalName, model) {
            this.controller.setProperties({
                showModal: true,
                modalName: modalName,
                modalContext: model
            });
        },
        closeModal: function() {
            this.controller.set('showModal', false);
        }
    }
});