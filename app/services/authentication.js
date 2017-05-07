import Ember from 'ember';
const { $, RSVP, Service, inject } = Ember;

export default Service.extend({
    store: inject.service(),
    authenticated: false,
    user: null,
    authenticate: function(username, password){
        let data = username && password ? {
            username, //'McTesty',
            password //'testtest'
        } : {
            logout: true
        };
        this.setProperties({
            authenticated: false,
            user: null
        });
        return RSVP.Promise.cast($.ajax({
            url: 'https://vchat-server.herokuapp.com/users/authenticate',
            method: 'POST',
            data
        })).then((data) => {
            if(data.meta.authenticated)
            {
                let store = this.get('store');
                store.pushPayload({users: data.users});
                this.setProperties({
                    authenticated: true,
                    user: store.peekRecord('user', data.meta.id)
                });
                return this.get('user');
            }
            return false;
        });
    },
    logout: function(){
        return this.authenticate(); 
    }
});