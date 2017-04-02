import Ember from 'ember';
const { Evented, Service, inject } = Ember;

export default Service.extend(Evented, {
    debug: inject.service(),
    nodeModules: inject.service(),
    settings: inject.service(),
    uri: inject.service(),
    //--------------------------------------------------------------------------
    //Socket IO instance variables
    socket: null,               //our current client socket
    connected: false,           //are we connected to a host?
    connectedTo: 'unknown',
    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    //The almighty peer connections hash to store all of our p2p RTC objects
    peerConnections: {
        //WebRTC link sets go here!
    },
    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    //The list of things to reset when our conversation has effectively ended
    disconnect: function(){
        let socket = this.get('socket');
        if(socket && typeof socket.disconnect === 'function')
        {
            socket.disconnect();
        }
        this.setProperties({
            peerConnections: {},
            connected: false,
            socket: null
        });
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
            let url = window.URL;
            let src = url.createObjectURL(evt.stream);
            this.trigger('addSource', id, src);
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
        this.trigger('removeSource', id);
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
                }, 
                (e) => {
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
    addHandlers: function(socket){
        socket.on('connect', () => {
            this.set('connected', true);
            this.trigger('connect');
        });
        socket.on('connect_error', (err) => {
            this.setProperties({
                connected: false,
                socket: null
            });
            this.trigger('connect_error', err);
        });
        socket.on('disconnect', () => {
            this.setProperties({
                connected: false,
                socket: null
            });
            this.trigger('disconnect');
        });
        socket.on('peerConnected', (data) => {
            this.makeOffer(data.id);
            this.trigger('peerConnected', data);
        });
        socket.on('peerDisconnected', (data) => {
            //goes to app route...
            this.removePeerConnection(data.id);
            this.trigger('peerDisconnected', data);
        });
        socket.on('webrtc', (data) => {
            this.handleNegotiation(data);
            this.trigger('webrtc', data);
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
        let protocol = address.indexOf('http:') === 0 ? 'http:' : (address.indexOf('https:') === 0 ? 'https:' : (address.indexOf('ws:') === 0 ? 'ws:' : (address.indexOf('wss:') === 0 ? 'wss:' : null)));
        let parser = URI.parse((protocol === null ? 'https://' : '') + address);
        parser.port = port;
        parser.protocol = 'https';
        let destination = URI.serialize(parser);
        this.disconnect();
        this.setProperties({
            connectedTo: destination,
            socket: client(URI.serialize(parser), {
                port: port,
                transports: ['polling', 'websocket'],
                'force new connection': true,
                reconnection: false,
                secure: true
            })
        });
        this.addHandlers(this.get('socket'));
    },
    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    //Abstract method to connect a websocket to an arbitrary address and port
    connectServer: function(addr, port){
        this.connectRTC(addr, parseInt(port, 10));
    }
});