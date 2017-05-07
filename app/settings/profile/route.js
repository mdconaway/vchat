import Ember from 'ember';
const { Route, inject } = Ember;

export default Route.extend({
    authentication: inject.service(),
    settings: inject.service(),
    model: function(){
        let authenticated = this.get('authentication.authenticated');
        return authenticated ? this.get('authentication.user') : false;
    },
    actions: {
        tryLogin: function(username, password){
            let failureMessage = 'Unable to login with the specified username and password.';
            this.send('openModal', 'modal-waiting', 'Logging in...');
            this.get('authentication').authenticate(username, password).then((record) => {
                if(record)
                {
                    this.controller.set('model', record);
                    this.send('closeModal');
                }
                else
                {
                    this.send('openModal', 'modal-alert', failureMessage);
                }
            }).catch(() => {
                this.send('openModal', 'modal-alert', failureMessage);
            });
        },
        logout: function(){
            this.send('openModal', 'modal-waiting', 'Logging out...');
            this.get('authentication').logout().then(() => {
                this.controller.set('model', false);
                this.send('closeModal');
            }).catch((err) => {
                this.send('openModal', 'modal-alert', err + '');
            });
        }
    }
});
