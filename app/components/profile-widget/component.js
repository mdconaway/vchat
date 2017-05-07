import Ember from 'ember';
const { Component } = Ember;

export default Component.extend({
    classNames: ['panel', 'panel-default'],
    model: {},
    actions: {
        submit: function(){
            this.sendAction('action', 'update', this.get('model'));
        },
        logout: function(){
            this.sendAction('action', 'logout');
        },
        info: function(){
            let message = '<p class="small">This is your current user profile</p>';
            message += '<p class="small">User profiles are largely anonymous, but they are used to help facilitate an initial connection for a video chat</p>';
            message += '<p class="small">Additionally, you can also save your contacts under your profile in order to make getting in touch easier.</p>';
            this.sendAction('action', 'openModal', 'modal-alert', message);
        }
    }
});
