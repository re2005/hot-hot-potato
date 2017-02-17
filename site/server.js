var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

var Game = {
	started: false,
	playerList: [],
	lockedPlayerList: [],
	queuedPlayerList: [],

	currentSocketId: null,

	addPlayer: function(socketId) {
		Game.playerList.push(socketId);
	},

	delPlayer: function(socketId) {
		Game.playerList.removeItem(socketId);

		// Delete playing players too
		Game.lockedPlayerList.removeItem(socketId);
		Game.queuedPlayerList.removeItem(socketId);
	},

	start: function() {
		Game.started = true;

		// Clone the connected players
		Game.lockedPlayerList = Game.playerList.clone();

		// Resets colors
		io.sockets.emit('change-color', { color: 'gray' });

		// Send event to start
		io.sockets.emit('start');

		// Start changing colors
		Game.changeColor();

		// Check the loser
		setTimeout(function() {
			Game.stop();
		}, 20000);
	},

	stop: function() {
		Game.started = false;

		// Mark the loser
		var socket = io.sockets.sockets[Game.currentSocketId];
		if (socket !== undefined) {
			socket.emit('change-color', { color: 'black' });
		}

		// Send event to stop
		io.sockets.emit('stop');

		// Reset current player
		Game.currentSocketId = null;
	},

	changeColor: function() {
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

		socket.emit('change-color', { color: 'red' });
	}
};

server.listen(8080);

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});
app.get('/channel.html', function (req, res) {
	res.sendfile(__dirname + '/channel.html');
});
app.get('/bg.png', function (req, res) {
	res.sendfile(__dirname + '/bg.png');
});
app.get('/potato.png', function (req, res) {
	res.sendfile(__dirname + '/potato.png');
});

io.sockets.on('connection', function (socket) {
  	// Add new player to list
	Game.addPlayer(socket.id);

	// Remove player when disconnected
	socket.on('disconnect', function() {
		Game.delPlayer(socket.id);
	});

	// NOT ME!!!
	socket.on('not-me', function(data) {
		console.log('not me');
		if (socket.id === Game.currentSocketId) {
			socket.emit('change-color', { color: 'gray' });

			Game.changeColor();
		}
	});

	// Start game
	socket.on('start', function(data) {
		console.log('start');
		if (Game.started) {
			return false;
		}
		Game.start();
	});
});

Array.prototype.shuffle = function() {
	var i = this.length, j, tempi, tempj;
	if (i === 0) {
		return this;
	}
	while ( --i ) {
		j       = Math.floor( Math.random() * ( i + 1 ) );
		tempi   = this[i];
		tempj   = this[j];
		this[i] = tempj;
		this[j] = tempi;
	}
	return this;
};

Array.prototype.clone = function() {
	return this.slice(0);
};

Array.prototype.removeItem = function(label) {
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
