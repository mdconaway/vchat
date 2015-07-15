import Ember from "ember";
export default Ember.TextField.extend({
    validate: function(v){
        var val = parseInt(v, 10);
        val = (isNaN(val) || val < 1) ? 9090 : val;
        return (v+'').length === (val+'').length;
    },
    focusOut: function(){    //hard reset value when out of bounds
        if(!this.validate(this.get('value')))
            this.set('value', '9090');
    },
    keyUp: function(){
        var v = this.get('value')+'';
        if(!this.validate(v))
        {
            if(v.length > 0)
            {
                var val = parseInt(v, 10);
                val = ((isNaN(val) || val < 1) ? 9090 : val)+'';
                this.set('value', val);
            }
            return false;
        }
    }
});