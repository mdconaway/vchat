import Ember from "ember";
const { TextField } = Ember;

export default TextField.extend({
    focusOut: function(){    //hard reset value when out of bounds
        let v = this.get('value');
        let val = v.replace(/ /g, '');
        let parser = URI(val);
        let protocol = parser.protocol();
        let hostname = parser.host();
        if(protocol === null || protocol === '')
        {
            parser = URI('http://'+val);
            protocol = parser.protocol();
            hostname = parser.host();
        }
        if(hostname === null || hostname === '')
        {
            parser = URI(protocol+"://localhost");
        }
        this.set('value', parser.toString());
    }
});