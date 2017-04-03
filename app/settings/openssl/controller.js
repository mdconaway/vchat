import Ember from 'ember';
const { Controller } = Ember;

export default Controller.extend({
    actions: {
        info: function(){
            let message = '<p class="small">OpenSSL is a software library to be used in applications that need to secure communications over computer networks against eavesdropping or need to ascertain the identity of the party at the other end. It has found wide use in internet web servers, serving a majority of all web sites.</p>';
            message += '<p class="small">Versions are available for most Unix and Unix-like operating systems, Linux, MacOS, and Windows.</p>';
            message += '<p class="small">This application needs OpenSSL to generate encryption keys to host calls.</p>';
            message += '<p class="small">If OpenSSL is available as a global system command, you DO NOT HAVE TO CONFIGURE THIS SETTING.</p>';
            this.send('openModal', 'modal-alert', message);
        }
    }
});
