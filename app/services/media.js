import Ember from 'ember';
const { Evented, RSVP, Service, inject } = Ember;

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
    getStream: function(size, promise, resolvers){
        let debug = this.get('debug');
        let streamW; 
        let streamH;
        //defer readiness
        let myPromise = new RSVP.Promise((res, rej) => {
            resolvers = resolvers ? resolvers : {res, rej};
            promise = promise ? promise : myPromise;
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
                    resolvers.res({stream, src});
                },
                (error) => {
                    debug.error(error);
                    if(!size)
                    {
                        this.getStream('M', promise, resolvers);
                    }
                    else if(size === 'M')
                    {
                        this.getStream('S', promise, resolvers);
                    }
                    else if(size === 'S')
                    {
                        //If we hit this block, everything has failed. There is no hope.
                        resolvers.rej(new Error('No camera/microphone!'));
                    }
                    /* do something */
                }
            );
        });
        
        return promise ? promise : myPromise;
        //----------------------------------------------------------------------
    },
    releaseStream: function(){
        let stream = this.get('stream');
        //let src = this.get('mySrc');
        if(stream)
        {
            stream.getTracks().forEach((track) => {
                track.stop();
            });
        }
    }
});