import Ember from "ember";
const { Controller, inject, on, run } = Ember;

export default Controller.extend({
    index: inject.controller(),
    showModal: false,
    modalName: '',
    modalContext: {},
    httpsServer: null,
    socketServer: null,
    rootSpace: {},
    listening: false,
    tryPort: '0',
    booting: true,  //temporary boolean to wait for ssl keys...
    setup: on('init', function(){
        let nodeModules = this.get('nodeModules');
        let https = nodeModules.get('https');
        let Io = nodeModules.get('socketIo');
        let pem = nodeModules.get('pem');
        //we can't do anything until we have ssl keys to host a call
        pem.createCertificate({days:999, selfSigned: true}, (err, keys) => {
            if(err)
            {
                alert('OpenSSL is not available on this machine.  Please install OpenSSL and restart the application.');
                process.exit(1);
            }
            else
            {
                this.set('booting', false);
                this.set('httpsServer', https.createServer({key: keys.serviceKey, cert: keys.certificate}));
                this.set('socketServer', new Io(this.get('httpsServer'), { 'transports': ['polling', 'websocket'], allowUpgrades: true, log: false }));
                this.set('rootSpace',  this.get('socketServer').of("/"));
                this.routeServer();
                this.get('httpsServer').on('error', () => {
                    this.set('listening', false);
                    this.send('openModal', 'modal-alert', 'Unable to listen on port: ' + this.get('tryPort'));
                    this.get('index').readyToCall();
                });
            }
        });
    }),
    listen: function(port){
        if(!this.get('booting'))
        {
            let listening = this.get('listening');
            port = (isNaN(port) || port < 1) ? 9090 : port;
            if(!listening)
            {
                this.set('tryPort', port);
                this.get('httpsServer').listen(port, () => {
                    this.set('listening', true);
                    this.get('index').readyToHost();
                });
            }
        }
        else
        {
            run.later(() => {
                this.listen(port);
            }, 1000);
        }
    },
    stopListening: function(){
        let listening = this.get('listening');
        let sockets = this.findSockets();
        if(listening)
        {
            this.get('httpsServer').close(() => {
                this.set('listening', false);
                this.get('index').readyToCall();
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
                if (socket) {
                    socket.broadcast.emit('peerDisconnected', { id: socket.id });
                }
            });
            
            debug.debug('Socket link established: ' + socket.id);
        });
    }
});