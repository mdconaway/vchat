import Ember from "ember";
export default Ember.Route.extend({
    _controller: {},
    setupController: function(controller, model) {
        controller.set('model', model);
        this.set('_controller', controller);
    },
    actions: {
        disconnectSocket: function(el){
            this.get('_controller').disconnectSocket(el);
        },
        hostServer: function(port){
            this.get('_controller').listen(port);
        },
        endHosting: function(){
            this.get('_controller').stopListening();
        },
        openModal: function(modalName, opts) {
            this.controllerFor(modalName).set('model', opts);
            return this.render(modalName, {
                into: 'application',
                outlet: 'modal'
            });
        },
        closeModal: function() {
            return this.disconnectOutlet({
                outlet: 'modal',
                parentView: 'application'
            });
        }

    }
});