import Ember from "ember";
export default Ember.Controller.extend({
    //--------------------------------------------------------------------------
    //Socket IO library and instance variables
    socketIoClient: null,       //our client socket library
    socket: null,               //our current client socket
    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    //Local media stream raw and url object
    stream: null,               //a raw stream object
    mySrc: null,                //an object url to our stream object
    streamWidth: 960,
    streamHeight: 720,
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
            this.send('openModal', 'modal.kick', el);
        },
        snapshot: function(blob){
            this.send('openModal', 'modal.snapshot', blob)
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
            this.send('openModal', 'modal.waiting', 'Connecting...');
            this.connectServer(this.get('joinAddress'), this.get('joinPort'));
        },
        host: function(){
            this.send('openModal', 'modal.waiting', 'Connecting...');
            localStorage.hostPort = this.get('hostPort');
            this.set('chooseMode', false);
            this.set('joinCall', false);
            this.set('hostCall', false);
            this.set('hostMode', true);
            this.send('hostServer', parseInt(this.get('hostPort'), 10));
        },
        disconnect: function(){
            var socket = this.get('socket');
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
        var srcs = this.get('src').toArray();
        for(var x = 0; x < srcs.length; x++)
        {
            if(srcs[x].id !== 0)
            {
                this.revokeObject(srcs[x].src);
            }
        }
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
        var maxx = 0;
        var maxy = 0;
        var srcs = this.get('src').toArray();
        var matrix = [];
        for(var x = 0; x < srcs.length; x++)
        {
            if(srcs[x].col > maxx)
                maxx = srcs[x].col;
            if(srcs[x].row > maxy)
                maxy = srcs[x].row;
        }
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
        for(var x = 0; x < maxx; x++)
        {
            matrix[x] = [];
            for(var y = 0; y < maxy; y++)
            {
                matrix[x][y] = false;
            }
        }
        for(var x = 0; x < srcs.length; x++)
        {
            matrix[parseInt(srcs[x].col, 10)-1][parseInt(srcs[x].row, 10)-1] = true;
        }
        for(var x = 0; x < maxx; x++)
        {
            for(var i = 0; i < x; i++)
            {
                if(!matrix[x][i])
                    return {x: x+1, y: i+1};
                if(!matrix[i][x])
                    return {x: i+1, y: x+1};
            }
        }
        return {x:1, y: maxy+1}
    },
    //--------------------------------------------------------------------------
    addSource: function(id, src){
        var coord = this.findMinCoords();
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
        var srcs = this.get('src').toArray();
        for(var x = 0; x < srcs.length; x++)
        {
            if(id === srcs[x].get('id'))
            {
                this.get('src').removeAt(x);
                this.revokeObject(srcs[x].get('src'));
                break;
            }
        }
    },
    revokeObject:function (objectUrl){
        setTimeout(function(){
            var url = window.URL;
            url.revokeObjectURL(objectUrl);
        }, 10);
    },
    //--------------------------------------------------------------------------
    //Handlers designed to shim the handling of a remote data stream to behave 
    //as a local object url (forwards to addSource and removeSource)
    addPeerStream: function(id, stream){
        var url = window.URL;
        var src = url.createObjectURL(stream);
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
        var self = this;
        var socket = this.get('socket');
        var peerConnections = this.get('peerConnections');
        var iceConfig = { 'iceServers': this.get('iceservers')};
        if (peerConnections[id]) {
            return peerConnections[id];
        }
        var pc = new RTCPeerConnection(iceConfig);
        peerConnections[id] = pc;
        pc.addStream(self.get('stream'));
        //
        pc.onicecandidate = function (evt) {
            socket.emit('webrtc', { to: id, ice: evt.candidate, type: 'ice' });
        };
        //
        pc.onaddstream = function (evt) {
            console.log('Received new stream');
            self.addPeerStream(id, evt.stream);
        };
        this.set('peerConnections', peerConnections);
        return pc;
    },
    removePeerConnection: function(id){
        var peerConnections = this.get('peerConnections');
        for(var x in peerConnections)
            if(peerConnections.hasOwnProperty(x))
            {
                if(x === id)
                {
                    peerConnections[id].close();
                    delete peerConnections[id];
                    break;
                }
            }
        this.removePeerStream(id);
        this.set('peerConnections', peerConnections);
    },
    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    //Handlers designed to make an ice offer to another peer, and to handle the 
    //ice/sdp negotiation process through the signaler
    makeOffer: function(id) {
        var socket = this.get('socket');
        var pc = this.getPeerConnection(id);
        pc.createOffer(
            function (sdp) {
                pc.setLocalDescription(sdp);
                console.log('Creating an offer for ' + id);
                socket.emit('webrtc', { to: id, sdp: sdp, type: 'sdp-offer' }); //by: currentId
            }, 
            function (e) {
                console.log(e);
            },
            { mandatory: { OfferToReceiveVideo: true, OfferToReceiveAudio: true }}
        );
    },
    handleNegotiation: function(data) {
        var socket = this.get('socket');
        var pc = this.getPeerConnection(data.by);
        switch (data.type) {
            case 'sdp-offer':
                pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
                    console.log('Setting remote description by offer' + data.sdp);
                    pc.createAnswer(function (sdp) {
                        pc.setLocalDescription(sdp);
                        socket.emit('webrtc', { to: data.by, sdp: sdp, type: 'sdp-answer' }); //by: currentId, 
                    });
                });
            break;
            case 'sdp-answer':
                pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
                    console.log('Setting remote description by answer' + data.sdp);
                }, function (e) {
                    console.error(e);
                });
            break;
            case 'ice':
                if (data.ice) {
                    console.log('Adding ice candidates' + data.ice);
                    pc.addIceCandidate(new RTCIceCandidate(data.ice));
                }
            break;
        }
    },
    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    //Add our event routing to our signaling socket
    addHandlers: function(){
        var self = this;
        var socket = this.get('socket');
        socket.on('connect', function(){
            self.addSource(0, self.get('mySrc'));
            self.set('connected', true);
            console.log('WebRTC connection established');
            self.send('closeModal');
        });
        socket.on('connect_error', function(err){
            console.log('connection error!');
            console.log(err);
            self.send('openModal', 'modal.alert', 'Unable to connect to: ' + self.get('connectedTo'));
            self.handleEnd();
        });
        socket.on('disconnect', function(){
            console.log('socket disconnected.');
            self.handleEnd();
        });
        socket.on('peerConnected', function (params) {
            self.makeOffer(params.id);
            console.log('peer detected, offering stream!');
        });
        socket.on('peerDisconnected', function (data) {
            //goes to app route...
            self.removePeerConnection(data.id);
            console.log('peer left, removing stream!');
        });
        socket.on('webrtc', function (data) {
            self.handleNegotiation(data);
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
        var client = this.get('socketIoClient');
        var socket = this.get('socket');
        var protocol = address.indexOf('http:') === 0 ? 'http:' : (address.indexOf('https:') === 0 ? 'https:' : (address.indexOf('ws:') === 0 ? 'ws:' : (address.indexOf('wss:') === 0 ? 'wss:' : null)));
        var parser = URI((protocol === null ? 'https://' : '') + address);
        parser.port(port);
        parser.protocol('https');
        if(socket)
        {
            socket.disconnect();
        }
        this.set('chooseMode', false);
        this.set('joinCall', false);
        this.set('hostCall', false);
        this.set('connectedTo', parser.toString());
        this.set('socket', client(parser.toString(), {
            port: port,
            transports: ['polling', 'websocket'],
            'force new connection': true,
            reconnection: false,
            secure: true
        }));
        this.addHandlers();
        parser = null;
    },
    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    //Abstract method to connect a websocket to an arbitrary address and port
    connectServer: function(addr, port){
        if(this.get('stream') !== null)
            this.connectRTC(addr, parseInt(port, 10));
    },
    //--------------------------------------------------------------------------
    setup: function(){
        var self = this;
        var streamW = this.get('streamWidth');
        var streamH = this.get('streamHeight');
        //----------------------------------------------------------------------
        this.set('socketIoClient', require('socket.io-client'));
        //----------------------------------------------------------------------
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
            function(stream) {
                var url = window.URL;
                var src = url ? url.createObjectURL(stream) : stream;
                self.set('stream', stream);
                self.set('mySrc', src);
                //advance readiness
            },
            function(error) {
                alert('No camera/microphone!');
                /* do something */ 
                //advance readiness
            }
        );
        //----------------------------------------------------------------------
    }.on('init')
});