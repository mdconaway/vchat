import Ember from "ember";
export default Ember.Component.extend({
    tagName: 'li',
    attributeBindings: ['data-sizex', 'data-sizey', 'data-col', 'data-row'],
    registerAs: null,
    src: null,
    volumeBar: null,
    init: function() {
        this._super();
        var me = this.get('src');
        // bind attributes beginning with 'data-'
        this.set('data-sizex', me.get('sizex') || 1);
        this.set('data-sizey', me.get('sizey') || 1);
        this.set('data-col', me.get('col') || 1);
        this.set('data-row', me.get('row') || 1);
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
    processChildElements: function (){
        var self = this;
        this.$().hover(function(){
            self.get('volumeBar').show();
        }, function(){
            self.get('volumeBar').hide();
        });
        if(this.get('src') !== null)
        {
            var me = this.get('src');
            var v = this.$().find('.video-box').first();
            v.prop('src', me.get('src'));//'http://clips.vorwaerts-gmbh.de/big_buck_bunny.ogv');
            v[0].onloadedmetadata = function(e) {
                v[0].play();
            };
            v[0].volume = me.get('volume');
        }
        else
        {
            alert('not ready!');
        }
        this.get('volumeBar').hide();
    },
    adjustVolume: function(){
        this.$().find('.video-box').first()[0].volume = this.get('src').get('volume');
    }.observes('src.volume'),
    _register: function() {
        this.set('registerAs', this); // register-as is a new property
    }.on('init')
});