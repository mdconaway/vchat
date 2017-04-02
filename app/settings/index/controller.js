import Ember from 'ember';
const { Controller } = Ember;

export default Controller.extend({
    newServer: '',
    actions: {
        addServer: function(){
            let s = this.get('newServer').trim();
            if(s)
            {
                this.get('model').pushObject({url: s});
                this.set('model', this.get('model').sortBy('url'));
                this.send('setServers', this.get('model'));
                this.set('newServer', '');
            }
        },
        removeServer: function(el){
            this.get('model').removeObject(el);
            this.send('setServers', this.get('model'));
        },
        info: function(){
            this.send('openModal', 'modal-alert', '<p class="small">Interactive Connectivity Establishment (ICE) is a technique used in computer networking to find ways for two computers to talk to each other as directly as possible in peer-to-peer networking. This is most commonly used for interactive media such as Voice over Internet Protocol (VoIP), peer-to-peer communications, video, and instant messaging. In such applications, you want to avoid communicating through a central server (which would slow down communication, and be expensive), but direct communication between client applications on the Internet is very tricky due to network address translators (NATs), firewalls, and other network barriers.</p><p class="small">ICE is developed by the Internet Engineering Task Force MMUSIC working group and is published as RFC 5245, which has obsoleted RFC 4091</p>');
        }
    }
});
