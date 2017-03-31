import Ember from "ember";
import FadeIn from "vchat/mixins/fade-in";
const { Component, run, on } = Ember;

export default Component.extend(FadeIn, {
    defaultFile: "screenshot",
    thumbnail: null,
    didInsertElement: function(){
        run.scheduleOnce('afterRender', this, 'processChildElements');
    },
    processChildElements: function(){
        let controller = this.get('controller');
        let nodeModules = this.get('nodeModules');
        let img = this.get('model');
        let fs = nodeModules.get('fs');
        let path = nodeModules.get('path');
        let saver = this.$().find('.save-button').first();
        this.set('defaultFile', ('screenshot-' + new Date()));
        this.createThumbnail();
        saver.one('change', () => {
            this.sendAction('openModal', 'modal-waiting', 'Saving...');
            let o = path.parse(saver.val());
            if(o.ext !== '')
            {
                o.base = o.base.slice(0, o.base.length - o.ext.length);
            }
            o.base = o.base + '.png';
            o.ext = '.png';
            fs.writeFile(path.format(o), img, (err) => {
                if(err) {
                    debug.error(err);
                } else {
                    debug.debug("The file was saved!");
                }
                controller.send('closeModal');
            });
        });
        this.$().find('.modal-submit').click(() => {
            saver.click();
        });
        run.later(() => {
            this.fadeIn();
        }, 10);
    },
    toBlob: function(buffer) {
        let ab = new ArrayBuffer(buffer.length);
        let view = new Uint8Array(ab);
        for(let i = 0; i < buffer.length; ++i) {
            view[i] = buffer[i];
        }
        return new Blob([view.buffer]);
    },
    createThumbnail: on('init', function(){
        let blob = this.toBlob(this.get('model'));
        let reader = new FileReader();
        reader.onload = (e) => {
            this.set('thumbnail', e.target.result);
        };
        reader.readAsDataURL(blob);
    }),
    actions: {
        close: function(){
            this.sendAction('closeModal');
        },
        confirm: function(){
            this.sendAction('closeModal');
        }
    }
});