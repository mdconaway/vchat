import Ember from "ember";
export default Ember.Component.extend({
    registerAs: null,
    src: null,
    didInsertElement : function () {
        Ember.run.scheduleOnce('afterRender', this, 'processChildElements');
    },
    willDestroyElement: function(){
        var v = this.$().find('.video-box').first();
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
            var b = this.$().find('.bounding-box').first();
            var v = this.$().find('.video-box').first();
            var p;
            v.prop('src', me.src);//'http://clips.vorwaerts-gmbh.de/big_buck_bunny.ogv');
            v[0].onloadedmetadata = function(e) {
                v[0].play();
            };
            
            //re-init our state if someone new joined
            if(typeof me.x !== 'undefined' && typeof me.y !== 'undefined')
            {
                b.css({top: me.y + "px", left: me.x + "px"});
            }
            if(typeof me.w !== 'undefined' && typeof me.h !== 'undefined')
            {
                b.width(me.w);
                b.height(me.h);
            }
            
            //setup our draggable and resizable wrapper
            b.draggable({
                start: function(event, ui) {
                    var p = ui.position;
                    me.x = p.left;
                    me.y = p.top;
                },
                drag: function(event, ui) {
                    var p = ui.position;
                    me.x = p.left;
                    me.y = p.top;
                },
                stop: function(event, ui) {
                    var p = ui.position;
                    me.x = p.left;
                    me.y = p.top;
                }
            }).resizable({
                aspectRatio: 4 / 3,
                start: function(event, ui) {
                    var h = ui.size.height;
                    var w = ui.size.width;
                    me.h = h;
                    me.w = w;
                },
                resize: function(event, ui) {
                    var h = ui.size.height;
                    var w = ui.size.width;
                    me.h = h;
                    me.w = w;
                },
                stop: function(event, ui) {
                    var h = ui.size.height;
                    var w = ui.size.width;
                    me.h = h;
                    me.w = w;
                }
            });
            p = b.position();
            //always overwrite our object settings with the current values after init
            me.x = p.left;
            me.y = p.top;
            me.w = b.outerWidth();
            me.h = b.outerHeight();
            console.log(me);
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