import Ember from 'ember';
import Debug from '../util/debug';
import ENV from 'vchat/config/environment';
const { Service, on } = Ember;

export default Service.extend(new Debug(window), {
    setup: on('init', function(){
        this.disableCache();
        if(ENV.environment === 'production')
        {
            this.setLevel(0);  //LOG NONE OF THE THINGS!
        }
        else
        {
            this.setLevel(9);  //LOG ALL THE THINGS!
        }
        this.debug(ENV.environment);
        this.debug(process.platform);
    })
});