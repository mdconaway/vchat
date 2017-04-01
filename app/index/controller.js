import Ember from "ember";
const { Controller, inject, on, run } = Ember;

export default Controller.extend({
    debug: inject.service(),
    nodeModules: inject.service(),
    settings: inject.service(),
    uri: inject.service(),
    //--------------------------------------------------------------------------
    //Socket IO instance variables
    socket: null,               //our current client socket
    //--------------------------------------------------------------------------
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
    //Sources array full of object url's and socket id's
    src: [],                    //an array full of id's and url's to stream objects
    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    //Server/Client mode, view state booleans, and input values
    hostMode: false,
    hostCall: false,
    hostPort: localStorage.hostPort || '9090',
    chooseMode: true,
    joinCall: false,
    connected: false,           //are we connected to a host?
    joinAddress: localStorage.joinAddress || 'https://localhost/',   //our target address, ip, or url
    joinPort: localStorage.joinPort || '9090',           //our target port
    connectedTo: 'unknown',
    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    //The almighty peer connections hash to store all of our p2p RTC objects
    peerConnections: {
        //WebRTC link sets go here!
    },
    //--------------------------------------------------------------------------
    actions: {
        close: function(el){
            this.send('openModal', 'modal-kick', el);
        },
        snapshot: function(blob){
            this.send('openModal', 'modal-snapshot', blob);
        },
        hostCall: function(){
            this.set('chooseMode', false);
            this.set('joinCall', false);
            this.set('hostCall', true);
        },
        joinCall: function(){
            this.set('chooseMode', false);
            this.set('hostCall', false);
            this.set('joinCall', true);
        },
        choose: function(){
            this.showChooser();
        },
        connect: function(){
            localStorage.joinAddress = this.get('joinAddress');
            localStorage.joinPort = this.get('joinPort');
            this.send('openModal', 'modal-waiting', 'Connecting...');
            this.connectServer(this.get('joinAddress'), this.get('joinPort'));
        },
        host: function(){
            this.send('openModal', 'modal-waiting', 'Connecting...');
            localStorage.hostPort = this.get('hostPort');
            this.set('chooseMode', false);
            this.set('joinCall', false);
            this.set('hostCall', false);
            this.set('hostMode', true);
            this.send('hostServer', parseInt(this.get('hostPort'), 10));
        },
        disconnect: function(){
            let socket = this.get('socket');
            if(socket && socket.disconnect)
            {
                socket.disconnect();
            }
        }
    },
    readyToHost: function(){
        this.connectServer('localhost', this.get('hostPort'));
    },
    readyToCall: function(){
        this.set('hostMode', false);
        this.handleEnd();
    },
    //--------------------------------------------------------------------------
    //Wrapper to perform all maniuplations needed to show our host/join 
    //chooser
    showChooser: function(){
        this.set('chooseMode', true);
        this.set('joinCall', false);
        this.set('hostCall', false);
    },
    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    //The list of things to reset when our conversation has effectively ended
    handleEnd: function(){
        let srcs = this.get('src');
        srcs.forEach((src) => {
            if(src.id !== 0)
            {
                this.revokeObject(src.src);
            }
        });
        this.set('peerConnections', {});
        this.set('connected', false);
        this.set('socket', null);
        this.get('src').clear();
        if(this.get('hostMode'))
        {
            this.set('joinCall', false);
            this.set('hostMode', false);
            this.send('endHosting');
        }
        else
        {
            this.showChooser();
        }
    },
    findMinCoords: function(){
        let maxx = 0;
        let maxy = 0;
        let srcs = this.get('src');
        let matrix = [];
        srcs.forEach((src) => {
            if(src.col > maxx)
            {
                maxx = src.col;
            }
            if(src.row > maxy)
            {
                maxy = src.row;
            }
        });
        maxx = parseInt(maxx, 10);
        maxy = parseInt(maxy, 10);
        if(maxx > maxy)
        {
            maxy = maxx;
        }
        else
        {
            maxx = maxy;
        }
        for(let a = 0; a < maxx; a++)
        {
            matrix[a] = [];
            for(let y = 0; y < maxy; y++)
            {
                matrix[a][y] = false;
            }
        }
        srcs.forEach((src) => {
            matrix[parseInt(src.col, 10)-1][parseInt(src.row, 10)-1] = true;
        });
        for(let c = 0; c < maxx; c++)
        {
            for(let i = 0; i < srcs.length; i++)
            {
                if(!matrix[c][i])
                {
                    return {x: c+1, y: i+1};
                }
                if(!matrix[i][c])
                {
                    return {x: i+1, y: c+1};
                }
            }
        }
        return {x:1, y: maxy+1};
    },
    //--------------------------------------------------------------------------
    addSource: function(id, src){
        let coord = this.findMinCoords();
        this.get('src').pushObject(Ember.Object.create({
            col: coord.x, 
            row: coord.y, 
            sizex: 5, 
            sizey: 5, 
            id: id, 
            src: src,
            effect: 'color',
            isOwner: 0 !== id && this.get('hostMode'),
            volume: 0 === id ? 0 : 1    //we probably don't want to hear ourselves talk...
        }));
    },
    removeSource: function(id){
        //just a note, we never need to worry about our own stream being passed
        //in here.  The stream id passed in will always come from a socket event
        this.get('src').forEach((src) => {
            if(id === src.get('id'))
            {
                this.get('src').removeObject(src);
                this.revokeObject(src.get('src'));
            }
        });
    },
    revokeObject:function (objectUrl){
        run.later(() => {
            let url = window.URL;
            url.revokeObjectURL(objectUrl);
        }, 10);
    },
    //--------------------------------------------------------------------------
    //Handlers designed to shim the handling of a remote data stream to behave 
    //as a local object url (forwards to addSource and removeSource)
    addPeerStream: function(id, stream){
        let url = window.URL;
        let src = url.createObjectURL(stream);
        this.addSource(id, src);
    },
    removePeerStream: function(id){
        this.removeSource(id);
    },
    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    //Handlers designed to setup, retrieve and remove a physical connection to 
    //a peer
    getPeerConnection: function(id){
        let socket = this.get('socket');
        let peerConnections = this.get('peerConnections');
        let debug = this.get('debug');
        let iceConfig = { 
            iceServers: this.get('settings').getIceServers()
        };
        if (peerConnections[id]) 
        {
            return peerConnections[id];
        }
        let pc = new RTCPeerConnection(iceConfig);
        peerConnections[id] = pc;
        pc.addStream(this.get('stream'));
        //
        pc.onicecandidate = (evt) => {
            socket.emit('webrtc', { to: id, ice: evt.candidate, type: 'ice' });
        };
        //
        pc.onaddstream = (evt) => {
            debug.debug('Received new stream');
            this.addPeerStream(id, evt.stream);
        };
        this.set('peerConnections', peerConnections);
        return pc;
    },
    removePeerConnection: function(id){
        let peerConnections = this.get('peerConnections');
        Object.keys(peerConnections).forEach((k) => {
            if(k === id)
            {
                peerConnections[id].close();
                delete peerConnections[id];
            }
        });
        this.removePeerStream(id);
        this.set('peerConnections', peerConnections);
    },
    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    //Handlers designed to make an ice offer to another peer, and to handle the 
    //ice/sdp negotiation process through the signaler
    makeOffer: function(id) {
        let socket = this.get('socket');
        let pc = this.getPeerConnection(id);
        let debug = this.get('debug');
        pc.createOffer(
            (sdp) => {
                pc.setLocalDescription(sdp);
                debug.debug('Creating an offer for ' + id);
                socket.emit('webrtc', { to: id, sdp: sdp, type: 'sdp-offer' }); //by: currentId
            }, 
            (e) => {
                debug.error(e);
            },
            { mandatory: { OfferToReceiveVideo: true, OfferToReceiveAudio: true }}
        );
    },
    handleNegotiation: function(data) {
        let socket = this.get('socket');
        let pc = this.getPeerConnection(data.by);
        let debug = this.get('debug');
        switch (data.type) {
            case 'sdp-offer':
                pc.setRemoteDescription(new RTCSessionDescription(data.sdp), () => {
                    debug.debug('Setting remote description by offer' + data.sdp);
                    pc.createAnswer((sdp) => {
                        pc.setLocalDescription(sdp);
                        socket.emit('webrtc', { to: data.by, sdp: sdp, type: 'sdp-answer' }); //by: currentId, 
                    });
                });
            break;
            case 'sdp-answer':
                pc.setRemoteDescription(new RTCSessionDescription(data.sdp), () => {
                    debug.debug('Setting remote description by answer' + data.sdp);
                }, (e) => {
                    debug.error(e);
                });
            break;
            case 'ice':
                if (data.ice) {
                    debug.debug('Adding ice candidates' + data.ice);
                    pc.addIceCandidate(new RTCIceCandidate(data.ice));
                }
            break;
        }
    },
    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    //Add our event routing to our signaling socket
    addHandlers: function(){
        let socket = this.get('socket');
        let debug = this.get('debug');
        socket.on('connect', () => {
            this.addSource(0, this.get('mySrc'));
            this.set('connected', true);
            debug.debug('WebRTC connection established');
            this.send('closeModal');
        });
        socket.on('connect_error', (err) => {
            debug.error('connection error!');
            debug.error(err);
            this.send('openModal', 'modal-alert', 'Unable to connect to: ' + this.get('connectedTo'));
            this.handleEnd();
        });
        socket.on('disconnect', () => {
            debug.debug('socket disconnected.');
            this.handleEnd();
        });
        socket.on('peerConnected', (params) => {
            this.makeOffer(params.id);
            debug.debug('peer detected, offering stream!');
        });
        socket.on('peerDisconnected', (data) => {
            //goes to app route...
            this.removePeerConnection(data.id);
            debug.debug('peer left, removing stream!');
        });
        socket.on('webrtc', (data) => {
            this.handleNegotiation(data);
        });
    },
    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    //Connect our socket to a signaling point to negotiate a video chat with 
    //a peer
    connectRTC: function(address, port){
        port = parseInt(port, 10);
        port = (isNaN(port) || port < 1) ? 9090 : port; 
        address = address.toLowerCase().trim();
        address = address.length === 0 ? 'https://localhost/' : address;
        let URI = this.get('uri');
        let client = this.get('nodeModules.socketIoClient');
        let socket = this.get('socket');
        let protocol = address.indexOf('http:') === 0 ? 'http:' : (address.indexOf('https:') === 0 ? 'https:' : (address.indexOf('ws:') === 0 ? 'ws:' : (address.indexOf('wss:') === 0 ? 'wss:' : null)));
        let parser = URI.parse((protocol === null ? 'https://' : '') + address);
        parser.port = port;
        parser.protocol = 'https';
        if(socket)
        {
            socket.disconnect();
        }
        this.set('chooseMode', false);
        this.set('joinCall', false);
        this.set('hostCall', false);
        this.set('connectedTo', URI.serialize(parser));
        this.set('socket', client(URI.serialize(parser), {
            port: port,
            transports: ['polling', 'websocket'],
            'force new connection': true,
            reconnection: false,
            secure: true
        }));
        this.addHandlers();
    },
    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    //Abstract method to connect a websocket to an arbitrary address and port
    connectServer: function(addr, port){
        if(this.get('stream') !== null)
        {
            this.connectRTC(addr, parseInt(port, 10));
        }
    },
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
                this.set('stream', stream);
                this.set('mySrc', src);
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
                    this.send('openModal', 'modal-alert', 'No camera/microphone!');
                }
                /* do something */
            }
        );
        //----------------------------------------------------------------------
    })
});