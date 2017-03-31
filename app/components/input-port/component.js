import Ember from "ember";
const { TextField } = Ember;

export default TextField.extend({
    validate: function(v){
        let val = parseInt(v, 10);
        val = (isNaN(val) || val < 1) ? 9090 : val;
        return (v+'').length === (val+'').length;
    },
    focusOut: function(){    //hard reset value when out of bounds
        if(!this.validate(this.get('value')))
            this.set('value', '9090');
    },
    keyUp: function(){
        let v = this.get('value')+'';
        if(!this.validate(v))
        {
            if(v.length > 0)
            {
                let val = parseInt(v, 10);
                val = ((isNaN(val) || val < 1) ? 9090 : val)+'';
                this.set('value', val);
            }
            return false;
        }
    }
});