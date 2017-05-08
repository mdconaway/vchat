import Ember from 'ember';
const { Controller } = Ember;
const minReqs = '<p>Usernames must be at least 3 characters.</p><p>Passwords must be at least 6 characters.</p>';

export default Controller.extend({
    username: '',
    password: '',
    actions: {
        info: function(){
            let message = '<p class="small">You can connect with your friends more easily if you make a user profile with the online vchat service.</p>';
            message += '<p class="small">A user profile is not necessary, but it will allow you to call a friend with a dynamic IP more easily anytime you are both logged in.</p>';
            this.send('openModal', 'modal-alert', message);
        },
        login: function(){
            let username = this.get('username');
            let password = this.get('password');
            if(username.length >= 3 && password.length >= 6)
            {
                this.send('tryLogin', username, password);
            }
            else
            {
                this.send('openModal', 'modal-alert', minReqs);
            }
        },
        update: function(record){
            let username = record.get('username');
            let password = record.get('password');
            if(username.length >= 3 && (!password || password.length >=6 ))
            {
                if(!password)
                {
                    record.set('password', undefined);
                }
                this.send('openModal', 'modal-waiting', 'Updating...');
                record.save().then(() => {
                    this.send('openModal', 'modal-alert', 'Profile updated');
                }).catch((err) => {
                    this.send('openModal', 'modal-alert', err+'');
                });
            }
            else
            {
                this.send('openModal', 'modal-alert', minReqs);
            }
        },
        forward: function(){
            this.send(...arguments);
        }
    }
});
