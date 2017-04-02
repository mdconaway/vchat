import Ember from 'ember';
const { Evented, RSVP, Service, inject } = Ember;

//Emitted events:
//error, msg (something went wrong!)
//open (server is up!)
//close (server is closed!)

export default Service.extend(Evented, {
    debug: inject.service(),
    nodeModules: inject.service(),
    httpsServer: null,
    socketServer: null,
    rootSpace: {},
    listening: false,
    serverEstablished: false,
    tryPort: '0',
    setup: function(){
        let nodeModules = this.get('nodeModules');
        let https = nodeModules.get('https');
        let Io = nodeModules.get('socketIo');
        let pem = nodeModules.get('pem');
        return new RSVP.Promise((res, rej) => {
            //we can't do anything until we have ssl keys to host a call
            pem.createCertificate({days:999, selfSigned: true}, (err, keys) => {
                if(err)
                {
                    rej('OpenSSL is not available on this machine, but it is required to host a call.  Please install OpenSSL and modify your OpenSSL path in settings.\n\r' + err);
                }
                else
                {
                    let httpsServer = https.createServer({key: keys.serviceKey, cert: keys.certificate});
                    let socketServer = new Io(httpsServer, { 'transports': ['polling', 'websocket'], allowUpgrades: true, log: false });
                    let rootSpace = socketServer.of('/');
                    this.setProperties({
                        httpsServer,
                        socketServer,
                        rootSpace,
                        serverEstablished: true
                    });
                    this.routeServer();
                    httpsServer.on('error', () => {
                        this.set('listening', false);
                        this.trigger('error', 'Unable to listen on port: ' + this.get('tryPort'));
                        this.trigger('close');
                    });
                    res();
                }
            });
        });
    },
    listen: function(port){
        let established = this.get('serverEstablished');
        let listening = this.get('listening');
        port = (isNaN(port) || port < 1) ? 9090 : port;
        if(!listening)
        {
            this.set('tryPort', port);
            if(established)
            {
                this.bindServer();
            }
            else
            {
                this.setup().then(() => {
                    this.bindServer();
                }).catch((err) => {
                    this.trigger('error', err);
                    this.trigger('close');
                });
            }
        }
    },
    bindServer: function(){
        this.get('httpsServer').listen(this.get('tryPort'), () => {
            this.set('listening', true);
            this.trigger('open');
        });
    },
    stopListening: function(){
        let listening = this.get('listening');
        let sockets = this.findSockets();
        if(listening)
        {
            this.get('httpsServer').close(() => {
                this.set('listening', false);
                this.trigger('close');
            });
        } 
        sockets.forEach((socket) => {
            socket.disconnect();
        });
    },
    disconnectSocket: function(el){
        let sockets = this.findSockets();
        sockets.forEach((socket) => {
            if(el === socket.id)
            {
                sockets.disconnect();
            }
        });
    },
    findSockets: function(roomId, namespace){   //find all sockets in a place
        let res = [];
        let ns = this.get('socketServer').of(namespace || "/");    // the default namespace is "/"

        if(ns)
        {
            Object.keys(ns.connected).forEach((id) => {
                if(roomId) 
                {
                    if(ns.connected[id].rooms.indexOf(roomId) !== -1) 
                    {
                        res.push(ns.connected[id]);
                    }
                } 
                else 
                {
                    res.push(ns.connected[id]);
                }
            });
        }
        return res;
    },
    routeServer: function(){
        let socketio = this.get('socketServer');
        let debug = this.get('debug');
        
        socketio.on('connection', (socket) => {
            
            socket.broadcast.emit('peerConnected', { id: socket.id });
            debug.debug('Alerting peers of new client: ' + socket.id);
            
            socket.on('webrtc', (data) => {
                let tgt = this.get('rootSpace').connected[data.to];
                if(tgt) 
                {
                    data.by = socket.id;
                    debug.debug('Redirecting message to: ' + data.to + ' from: ' + data.by);
                    debug.debug('Message data: ' + JSON.stringify(data));
                    tgt.emit('webrtc', data);
                }
                else
                {
                    debug.warn('Invalid user');
                }
            });

            socket.on('disconnect', () => {
                if(socket) 
                {
                    socket.broadcast.emit('peerDisconnected', { id: socket.id });
                }
            });
            
            debug.debug('Socket link established: ' + socket.id);
        });
    }
});