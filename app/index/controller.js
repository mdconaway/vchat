import Ember from "ember";
const { Controller, inject, on, run } = Ember;

export default Controller.extend({
    debug: inject.service(),
    media: inject.service(),
    settings: inject.service(),
    socketClient: inject.service(),
    socketServer: inject.service(),
    uri: inject.service(),
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
    joinAddress: localStorage.joinAddress || 'https://localhost/',   //our target address, ip, or url
    joinPort: localStorage.joinPort || '9090',           //our target port
    //--------------------------------------------------------------------------
    bindSocketClient: on('init', function(){
        let debug = this.get('debug');
        let socketClient = this.get('socketClient');
        let media = this.get('media');
        this.send('openModal', 'modal-waiting', 'Detecting Camera...');
        media.on('connect', () => {
            this.send('closeModal');
        });
        media.on('error', (err) => {
            this.send('openModal', 'modal-alert', err);
        });
        socketClient.on('addSource', (id, src) => {
            this.addSource(id, src);
        });
        socketClient.on('removeSource', (id) => {
            this.removeSource(id);
        });
        socketClient.on('connect', () => {
            this.addSource(0, this.get('media.mySrc'));
            debug.debug('WebRTC connection established');
            this.send('closeModal');
        });
        socketClient.on('connect_error', (err) => {
            debug.error('connection error!');
            debug.error(err);
            this.send('openModal', 'modal-alert', 'Unable to connect to: ' + this.get('socketClient.connectedTo'));
            this.handleEnd();
        });
        socketClient.on('disconnect', () => {
            debug.debug('socket disconnected.');
            this.handleEnd();
        });
        socketClient.on('peerConnected', () => { //data
            debug.debug('peer detected, offering stream!');
        });
        socketClient.on('peerDisconnected', (data) => {
            //goes to app route...
            this.removePeerConnection(data.id);
            debug.debug('peer left, removing stream!');
        });
        socketClient.on('webrtc', (data) => {
            this.handleNegotiation(data);
        });
    }),
    actions: {
        close: function(el){
            this.send('openModal', 'modal-kick', el);
        },
        snapshot: function(blob){
            this.send('openModal', 'modal-snapshot', blob);
        },
        hostCall: function(){
            this.setProperties({
                chooseMode: false,
                joinCall: false,
                hostCall: true
            });
        },
        joinCall: function(){
            this.setProperties({
                chooseMode: false,
                joinCall: true,
                hostCall: false
            });
        },
        choose: function(){
            this.showChooser();
        },
        connect: function(){
            if(this.get('media.mySrc'))
            {
                localStorage.joinAddress = this.get('joinAddress');
                localStorage.joinPort = this.get('joinPort');
                this.send('openModal', 'modal-waiting', 'Connecting...');
                this.get('socketClient').connectServer(this.get('joinAddress'), this.get('joinPort'));
            }
            else
            {
                this.send('openModal', 'modal-alert', 'This device does not have a camera and microphone.');
            }
        },
        host: function(){
            if(this.get('media.mySrc'))
            {
                this.send('openModal', 'modal-waiting', 'Connecting...');
                localStorage.hostPort = this.get('hostPort');
                this.setProperties({
                    chooseMode: false,
                    joinCall: false,
                    hostCall: false,
                    hostMode: true
                });
                this.get('socketServer').listen(parseInt(this.get('hostPort'), 10));
            }
            else
            {
                this.send('openModal', 'modal-alert', 'This device does not have a camera and microphone.');
            }
        },
        disconnect: function(){
            this.get('socketClient').disconnect();
        }
    },
    readyToHost: function(){
        this.get('socketClient').connectServer('localhost', this.get('hostPort'));
    },
    readyToCall: function(){
        this.set('hostMode', false);
        this.handleEnd();
    },
    //--------------------------------------------------------------------------
    //Wrapper to perform all maniuplations needed to show our host/join 
    //chooser
    showChooser: function(){
        this.setProperties({
            chooseMode: true,
            joinCall: false,
            hostCall: false
        });
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
        this.get('src').clear();
        this.get('socketClient').disconnect();
        if(this.get('hostMode'))
        {
            this.setProperties({
                joinCall: false,
                hostMode: false
            });
            this.get('socketServer').stopListening();
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
        let src = this.get('src').findBy('id', id);
        if(src)
        {
            this.get('src').removeObject(src);
            this.revokeObject(src.get('src'));
        }
    },
    revokeObject: function (objectUrl){
        run.scheduleOnce('afterRender', () => {
            let url = window.URL;
            url.revokeObjectURL(objectUrl);
        });
    },
    //--------------------------------------------------------------------------
});