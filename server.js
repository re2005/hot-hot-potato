#!/usr/bin/env node

var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});
app.get('/potato.png', function (req, res) {
    res.sendFile(__dirname + '/potato.png');
});
app.get('/styles.css', function (req, res) {
    res.sendFile(__dirname + '/styles.css');
});
app.get('/admin', function (req, res) {
    res.sendFile(__dirname + '/admin.html');
});
app.get('/client.js', function (req, res) {
    res.sendFile(__dirname + '/client.js');
});
app.get('/admin.js', function (req, res) {
    res.sendFile(__dirname + '/admin.js');
});

server.listen(80);

var Game = {
    started: false,
    playerList: [],
    lockedPlayerList: [],
    queuedPlayerList: [],
    currentSocketId: null,

    addPlayer: function (socketId) {
        Game.playerList.push(socketId);
    },

    delPlayer: function (socketId) {
        Game.playerList.removeItem(socketId);

        // Delete playing players too
        Game.lockedPlayerList.removeItem(socketId);
        Game.queuedPlayerList.removeItem(socketId);
    },

    start: function () {
        Game.started = true;

        // Clone the connected players
        Game.lockedPlayerList = Game.playerList.clone();

        // Resets colors
        io.sockets.emit('change-color', {color: 'gray'});

        // Send event to start
        io.sockets.emit('start');

        // Start changing colors
        Game.changeColor();

        // Check the loser
        setTimeout(function () {
            Game.stop();
        }, 20000);
    },

    stop: function () {
        Game.started = false;

        // Mark the loser
        var socket = io.sockets.sockets[Game.currentSocketId];
        if (socket !== undefined) {
            socket.emit('change-color', {color: 'black'});
        }

        // Send event to stop
        io.sockets.emit('stop');

        // Reset current player
        Game.currentSocketId = null;
    },

    changeColor: function () {
        if (Game.queuedPlayerList.length === 0) {
            Game.queuedPlayerList = Game.lockedPlayerList.clone();
            Game.queuedPlayerList.shuffle();
        }

        // Get the next queued player
        Game.currentSocketId = Game.queuedPlayerList.shift();

        var socket = io.sockets.sockets[Game.currentSocketId];
        if (socket === undefined) {
            return Game.changeColor();
        }

        socket.emit('change-color', {color: 'red'});
    }
};

io.sockets.on('connection', function (socket) {

    var isAdmin = socket.handshake.url.indexOf('admin') > 0;
    if (!isAdmin) Game.addPlayer(socket.id);

    socket.on('get-connected-users', function () {
        io.emit('users-connected', Game.playerList.length);
    });

    socket.on('new-user', function () {
        io.emit('new-user-connected', Game.playerList);
    });

    socket.on('disconnect', function () {
        Game.delPlayer(socket.id);
        io.emit('user-desconnected', Game.playerList);
    });

    socket.on('not-me', function () {
        console.log('not-me');
        if (socket.id === Game.currentSocketId) {
            socket.emit('change-color', {color: 'gray'});
            Game.changeColor();
        }
    });

    socket.on('start', function () {
        console.log('start');
        if (Game.started) {
            return false;
        }
        Game.start();
    });
});

Array.prototype.shuffle = function () {
    var i = this.length, j, tempi, tempj;
    if (i === 0) {
        return this;
    }
    while (--i) {
        j = Math.floor(Math.random() * ( i + 1 ));
        tempi = this[i];
        tempj = this[j];
        this[i] = tempj;
        this[j] = tempi;
    }
    return this;
};

Array.prototype.clone = function () {
    return this.slice(0);
};

Array.prototype.removeItem = function (label) {
    var i = this.length;
    if (i === 0) {
        return this;
    }
    while (--i > -1) {
        if (this[i] === label) {
            this.splice(i, 1);
            return this;
        }
    }
    return this;
};
