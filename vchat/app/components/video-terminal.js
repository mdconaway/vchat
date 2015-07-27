import Ember from "ember";
export default Ember.Component.extend({
    tagName: 'li',
    attributeBindings: ['data-sizex', 'data-sizey', 'data-col', 'data-row'],
    registerAs: null,
    src: null,
    videoReady: false,
    //--------------------------------------------------------------------------
    //external control components
    controlNames: ["volumeBar", "kickButton", "snapshotButton"],
    volumeBar: null,
    kickButton: null,
    snapshotButton: null,
    //--------------------------------------------------------------------------
    init: function() {
        this._super();
        var me = this.get('src');
        // bind attributes beginning with 'data-'
        this.set('data-sizex', me.get('sizex') || 1);
        this.set('data-sizey', me.get('sizey') || 1);
        this.set('data-col', me.get('col') || 1);
        this.set('data-row', me.get('row') || 1);
    },
    actions: {
        kick: function(){
            this.sendAction('close', this.get('src.id'));
        },
        snapshot: function(){
            if(this.get('videoReady'))  //meta data must be loaded to snapshot
            {
                var v = this.$().find('.video-box').first()[0];
                var c = document.createElement('canvas');
                var ctx = c.getContext('2d');
                var w = v.videoWidth;
                var h = v.videoHeight;
                var url, imgData, data, buf;
                c.width = w;
                c.height = h;
                ctx.drawImage(v,0,0,w,h);
                imgData = c.toDataURL('image/png');
                data = imgData.replace(/^data:image\/\w+;base64,/, "");
                buf = new Buffer(data, 'base64');
                this.sendAction('snapshot', buf);
            }
        }
    },
    didInsertElement : function () {
        Ember.run.scheduleOnce('afterRender', this, 'processChildElements');
    },
    willDestroyElement: function(){
        var v = this.$().find('.video-box').first();
        var me = this.get('src');
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
        var names = this.get('controlNames').toArray();
        for(var x = 0; x < names.length; x++)
            if(this.get(names[x]) !== null)
                this.get(names[x]).show();
    },
    hideControls: function(){
        var names = this.get('controlNames').toArray();
        for(var x = 0; x < names.length; x++)
            if(this.get(names[x]) !== null)
                this.get(names[x]).hide();
    },
    processChildElements: function (){
        var self = this;
        this.$().hover(function(){
            self.showControls();
        }, function(){
            self.hideControls();
        });
        if(this.get('src') !== null)
        {
            var me = this.get('src');
            var v = this.$().find('.video-box').first();
            v.prop('src', me.get('src'));//'http://clips.vorwaerts-gmbh.de/big_buck_bunny.ogv');
            v[0].onloadedmetadata = function(e) {
                v[0].play();
                self.set('videoReady', true);
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
    _register: function() {
        this.set('registerAs', this); // register-as is a new property
    }.on('init')
});