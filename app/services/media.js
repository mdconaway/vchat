import Ember from 'ember';
const { Evented, Service, inject, on } = Ember;

export default Service.extend(Evented, {
    debug: inject.service(),
    //--------------------------------------------------------------------------
    //Local media stream raw and url object
    stream: null,               //a raw stream object
    mySrc: null,                //an object url to our stream object
    streamWidth: 960,
    streamHeight: 720,
    midWidth: 640,
    midHeight: 480,
    smallWidth: 320,
    smallHeight: 240,
    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    setup: on('init', function(size){
        let debug = this.get('debug');
        let streamW; 
        let streamH; 
        if(!size)
        {
            streamW = this.get('streamWidth');
            streamH = this.get('streamHeight');
        }
        else if(size === 'M')
        {
            streamW = this.get('midWidth');
            streamH = this.get('midHeight');
        }
        else if(size === 'S')
        {
            streamW = this.get('smallWidth');
            streamH = this.get('smallHeight');
        }
        //defer readiness
        window.navigator.getUserMedia(
            {
                audio: true, 
                video: {
                    mandatory: {
                        "minWidth": streamW,
                        "minHeight": streamH,
                        "maxWidth": streamW,
                        "maxHeight": streamH
                    }
                }
            },
            (stream) => {
                let url = window.URL;
                let src = url ? url.createObjectURL(stream) : stream;
                debug.debug(stream);
                debug.debug(src);
                this.setProperties({
                    stream: stream,
                    mySrc: src
                });
                this.trigger('connect');
            },
            (error) => {
                debug.error(error);
                if(!size)
                {
                    this.setup('M');
                }
                else if(size === 'M')
                {
                    this.setup('S');
                }
                else if(size === 'S')
                {
                    //If we hit this block, everything has failed. There is no hope.
                    this.trigger('error', 'No camera/microphone!');
                }
                /* do something */
            }
        );
        //----------------------------------------------------------------------
    })
});