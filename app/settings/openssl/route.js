import Ember from 'ember';
const { Route, RSVP, run, inject } = Ember;

export default Route.extend({
    settings: inject.service(),
    model: function(){
        //copy the value, and make it async so loading can happen without freezing
        return new RSVP.Promise((res) => {
            run.later('afterRender', () => {
                res(this.get('settings').getOpenSSLPath());
            });
        });
    },
    actions: {
        setPath: function(s){
            this.get('settings').setOpenSSLPath(s.trim());
            this.refresh();
        },
        resetPath: function(){
            this.get('settings').setOpenSSLPath('');
            this.refresh();
        }
    }
});
