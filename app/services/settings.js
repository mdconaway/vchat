import Ember from 'ember';
import defaultIceServers from '../util/defaultIceServers';
const { A, isArray, Service } = Ember;

export default Service.extend({
    //--------------------------------------------------------------------------
    //ICE Server Settings
    iceServers: localStorage.iceServers ? A(JSON.parse(localStorage.iceServers)).sortBy('url') : A(defaultIceServers).sortBy('url'),
    resetIceServers: function(){
        this.setIceServers(defaultIceServers);
        return this.getIceServers();
    },
    getIceServers: function(){
        return this.get('iceServers');
    },
    setIceServers: function(servers){
        let isValid = true;
        if(isArray(servers))
        {
            servers = A(servers);
            servers.forEach((server) => {
                if(typeof server.url !== 'string')
                {
                    isValid = false;
                }
            });
            if(isValid)
            {
                servers = servers.sortBy('url');
                this.set('iceServers', servers);
                localStorage.iceServers = JSON.stringify(servers.toArray());
            }
        }
    },
    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    //OpenSSL Settings
    openSSLPath: localStorage.openSSLPath ? localStorage.openSSLPath : '',
    getOpenSSLPath: function(){
        return this.get('openSSLPath');
    },
    setOpenSSLPath: function(s){
        let path = (s + '').trim();
        localStorage.openSSLPath = path;
        this.set('openSSLPath', path);
    }
    //--------------------------------------------------------------------------
});