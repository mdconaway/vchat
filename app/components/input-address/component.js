import Ember from "ember";
const { TextField, inject } = Ember;

export default TextField.extend({
    uri: inject.service(),
    focusOut: function(){    //hard reset value when out of bounds
        let URI = this.get('uri');
        let v = this.get('value');
        let val = v.replace(/ /g, '');
        let parser = URI.parse(val);
        let protocol = parser.protocol;
        let hostname = parser.host;
        if(protocol === null || protocol === '')
        {
            parser = URI.parse('http://'+val);
            protocol = parser.protocol;
            hostname = parser.host;
        }
        if(hostname === null || hostname === '')
        {
            parser = URI.parse(protocol+"://localhost");
        }
        this.set('value', URI.serialize(parser));
    }
});