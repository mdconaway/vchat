import Ember from 'ember';
import defaultIceServers from '../util/defaultIceServers';
const { Service } = Ember;

export default Service.extend({
    defaultIceServers: defaultIceServers,
    getIceServers: function(){
        return this.get('defaultIceServers');
    }
});