import Ember from "ember";
const { Route, inject } = Ember;

export default Route.extend({
    socketServer: inject.service(),
    actions: {
        disconnectSocket: function(el){
            this.get('socketServer').disconnectSocket(el);
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