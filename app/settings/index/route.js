import Ember from 'ember';
const { Route, inject } = Ember;

export default Route.extend({
    settings: inject.service(),
    model: function(){
        //copy the array
        return this.get('settings').getIceServers().concat([]);
    },
    actions: {
        setServers: function(arr){
            this.get('settings').setIceServers(arr);
        },
        resetServers: function(){
            this.get('settings').resetIceServers();
            this.controller.set('model', this.model());
        }
    }
});
