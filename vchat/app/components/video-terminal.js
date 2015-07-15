import Ember from "ember";
export default Ember.Component.extend({
    tagName: 'li',
    attributeBindings: ['data-sizex', 'data-sizey', 'data-col', 'data-row'],
    registerAs: null,
    src: null,
    init: function() {
        this._super();
        var me = this.get('src');
        // bind attributes beginning with 'data-'
        this.set('data-sizex', me.sizex || 1);
        this.set('data-sizey', me.sizey || 1);
        this.set('data-col', me.col || 1);
        this.set('data-row', me.row || 1);
    },
    didInsertElement : function () {
        Ember.run.scheduleOnce('afterRender', this, 'processChildElements');
    },
    willDestroyElement: function(){
        var v = this.$().find('.video-box').first();
        var me = this.get('src');
        //save our state to the vanilla js object that represents our feed
        me.sizex = this.$().data('data-sizex');
        me.sizey = this.$().data('data-sizey');
        me.col = this.$().data('data-col');
        me.row = this.$().data('data-row');
        if(v && v[0])
        {
            v[0].pause();
            v.prop('src', '');
        }
    },
    processChildElements: function (){
        if(this.get('src') !== null)
        {
            var me = this.get('src');
            var v = this.$().find('.video-box').first();
            v.prop('src', me.src);//'http://clips.vorwaerts-gmbh.de/big_buck_bunny.ogv');
            v[0].onloadedmetadata = function(e) {
                v[0].play();
            };
        }
        else
        {
            alert('not ready!');
        }
    },
    _register: function() {
        this.set('registerAs', this); // register-as is a new property
    }.on('init')
});