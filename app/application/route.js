import Ember from "ember";
const { Route, inject, on } = Ember;

export default Route.extend({
    socketServer: inject.service(),
    bindToServer: on('init', function(){
        let socketServer = this.get('socketServer');
        socketServer.on('open', () => {
            this.controller.get('index').readyToHost();
        });
        socketServer.on('close', () => {
            this.controller.get('index').readyToCall();
        });
        socketServer.on('error', (err) => {
            this.send('openModal', 'modal-alert', err);
        });
    }),
    actions: {
        disconnectSocket: function(el){
            this.get('socketServer').disconnectSocket(el);
        },
        hostServer: function(port){
            this.controller.set('waiting', true);
            this.get('socketServer').listen(port);
        },
        endHosting: function(){
            this.get('socketServer').stopListening();
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