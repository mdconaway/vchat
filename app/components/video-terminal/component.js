import Ember from "ember";
const { Component, run } = Ember;

export default Component.extend({
    tagName: 'li',
    attributeBindings: ['data-sizex', 'data-sizey', 'data-col', 'data-row'],
    registerAs: null,
    src: null,
    videoReady: false,
    //--------------------------------------------------------------------------
    //external control components
    controlNames: ["volumeBar", "kickButton", "snapshotButton", "effectChooser"],
    volumeBar: null,
    kickButton: null,
    snapshotButton: null,
    effectChooser: null,
    //--------------------------------------------------------------------------
    init: function() {
        let me = this.get('src');
        // bind attributes beginning with 'data-'
        this.setProperties({
            'data-sizex': me.get('sizex') || 1,
            'data-sizey': me.get('sizey') || 1,
            'data-col': me.get('col') || 1,
            'data-row': me.get('row') || 1
        });
        this._super();
    },
    actions: {
        kick: function(){
            this.sendAction('close', this.get('src.id'));
        },
        snapshot: function(){
            if(this.get('videoReady'))  //meta data must be loaded to snapshot
            {
                let filters = this.get('filters');
                let effect = this.get('src.effect');
                let v = this.$().find('.video-box').first()[0];
                let c = document.createElement('canvas');
                let ctx = c.getContext('2d');
                let w = v.videoWidth;
                let h = v.videoHeight;
                let imgData, data, buf, pixels;
                c.width = w;
                c.height = h;
                ctx.drawImage(v,0,0,w,h);
                if(effect !== 'color')
                {
                    if(effect === 'grey')
                    {
                        pixels = filters.grayscale(filters.getPixels(c));
                    }
                    if(effect === 'sepia')
                    {
                        pixels = filters.sepia(filters.getPixels(c), 1.5);
                    }
                    if(effect === 'abstract')
                    {
                        pixels = filters.invert(filters.getPixels(c));
                    }
                    c = filters.toCanvas(pixels);
                }
                imgData = c.toDataURL('image/png');
                data = imgData.replace(/^data:image\/\w+;base64,/, "");
                buf = new Buffer(data, 'base64');
                this.sendAction('snapshot', buf);
            }
        }
    },
    didInsertElement : function () {
        run.scheduleOnce('afterRender', this, 'processChildElements');
    },
    willDestroyElement: function(){
        let v = this.$().find('.video-box').first();
        let me = this.get('src');
        //save our state to the vanilla js object that represents our feed
        me.set('sizex', this.$().data('data-sizex'));
        me.set('sizey', this.$().data('data-sizey'));
        me.set('col', this.$().data('data-col'));
        me.set('row', this.$().data('data-row'));
        if(v && v[0])
        {
            v[0].pause();
            v.prop('src', '');
        }
    },
    showControls: function(){
        let names = this.get('controlNames');
        names.forEach((name) => {
            if(this.get(name) !== null)
            {
                this.get(name).show();
            }   
        }); 
    },
    hideControls: function(){
        let names = this.get('controlNames');
        names.forEach((name) => {
            if(this.get(name) !== null)
            {
                this.get(name).hide();
            }   
        });
    },
    processChildElements: function (){
        this._register();
        this.$().hover(() => {
            this.showControls();
        }, () => {
            this.hideControls();
        });
        if(this.get('src') !== null)
        {
            let me = this.get('src');
            let v = this.$().find('.video-box').first();
            v.addClass(me.get('effect'));
            v.prop('src', me.get('src'));//'http://clips.vorwaerts-gmbh.de/big_buck_bunny.ogv');
            v[0].onloadedmetadata = () => {
                v[0].play();
                this.set('videoReady', true);
            };
            v[0].volume = me.get('volume');
        }
        else
        {
            alert('not ready!');
        }
        this.hideControls();
    },
    adjustVolume: function(){
        this.$().find('.video-box').first()[0].volume = this.get('src').get('volume');
    }.observes('src.volume'),
    adjustEffect: function(){
        let me = this.get('src');
        let v = this.$().find('.video-box').first();
        v.removeClass('color');
        v.removeClass('grey');
        v.removeClass('sepia');
        v.removeClass('abstract');
        v.addClass(me.get('effect'));
    }.observes('src.effect'),
    _register: function() {
        this.set('registerAs', this); // register-as is a new property
    }
});