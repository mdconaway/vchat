import Ember from "ember";
export default Ember.Controller.extend({
    needs: ['index'],
    httpServer: null,
    socketServer: null,
    rootSpace: {},
    listening: false,
    tryPort: '0',
    setup: function(){
        var self = this;
        var http = require('http');
        var io = require('socket.io');
        this.set('httpServer', http.createServer());
        this.set('socketServer', new io(this.get('httpServer'), { 'transports': ['polling', 'websocket'], allowUpgrades: true, log: false }));
        this.set('rootSpace',  this.get('socketServer').of("/"));
        this.routeServer();
        this.get('httpServer').on('error', function(){
            self.set('listening', false);
            self.send('openModal', 'modal.alert', 'Unable to listen on port: ' + self.get('tryPort'));
            self.get('controllers.index').readyToCall();
        });
    }.on('init'),
    listen: function(port){
        var self = this;
        var listening = this.get('listening');
        port = (isNaN(port) || port < 1) ? 9090 : port;
        if(!listening)
        {
            this.set('tryPort', port);
            this.get('httpServer').listen(port, function(){
                self.set('listening', true);
                self.get('controllers.index').readyToHost();
            });
        }
    },
    stopListening: function(){
        var self = this;
        var listening = this.get('listening');
        var sockets = this.findSockets();
        if(listening)
            this.get('httpServer').close(function(){
                self.set('listening', false);
                self.get('controllers.index').readyToCall();
            });
        for(var x = 0; x < sockets.length; x++)
            sockets[x].disconnect();
    },
    findSockets: function(roomId, namespace){   //find all sockets in a place
        var res = []
        , ns = this.get('socketServer').of(namespace || "/");    // the default namespace is "/"

        if (ns) {
            for (var id in ns.connected) {
                if(roomId) {
                    var index = ns.connected[id].rooms.indexOf(roomId) ;
                    if(index !== -1) {
                        res.push(ns.connected[id]);
                    }
                } else {
                    res.push(ns.connected[id]);
                }
            }
        }
        return res;
    },
    routeServer: function(){
        var self = this,
            socketio = this.get('socketServer');
    
        socketio.on('connection', function (socket) {
            
            socket.broadcast.emit('peerConnected', { id: socket.id });
            console.log('Alerting peers of new client: ' + socket.id);
            
            socket.on('webrtc', function (data) {
                var tgt = self.get('rootSpace').connected[data.to];
                if (tgt) {
                    data.by = socket.id;
                    console.log('Redirecting message to: ' + data.to + ' from: ' + data.by);
                    console.log('Message data: ' + JSON.stringify(data));
                    tgt.emit('webrtc', data);
                }
                else
                {
                    console.warn('Invalid user');
                }
            });

            socket.on('disconnect', function () {
                if (socket) {
                    socket.broadcast.emit('peerDisconnected', { id: socket.id });
                }
            });
            
            console.log('Socket link established: ' + socket.id);
        });
    }
});