import Ember from "ember";
export default Ember.TextField.extend({
    focusOut: function(){    //hard reset value when out of bounds
        var v = this.get('value');
        var val = v.replace(/ /g, '');
        var parser = URI(val);
        var protocol = parser.protocol();
        var hostname = parser.host();
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