import Ember from "ember";
export default Ember.Controller.extend({
    defaultFile: "screenshot",
    thumbnail: null,
    actions: {
        close: function(){
            this.send('closeModal');
        },
        confirm: function(){
            this.send('closeModal');
        }
    },
    toBlob: function(buffer) {
        var ab = new ArrayBuffer(buffer.length);
        var view = new Uint8Array(ab);
        for(var i = 0; i < buffer.length; ++i) {
            view[i] = buffer[i];
        }
        return new Blob([view.buffer]);
    },
    createThumbnail: function(){
        var self = this;
        var blob = this.toBlob(this.get('model'));
        var reader = new FileReader();
        reader.onload = function(e) {
            self.set('thumbnail', e.target.result);
        };
        reader.readAsDataURL(blob);
    }.observes('model')
});