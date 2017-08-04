$(document).ready(function () {

    var socket;

    var bind = function () {

        socket = io.connect('https://hot-hot-potato.herokuapp.com/?admin');

        socket.on('connect', function () {
            $('html').css('background-color', 'gray');
            socket.emit('get-connected-users');
        });

        socket.on('users-connected', function (usersConnected) {
            $('#players').html(usersConnected);
        });

        socket.on('user-desconnected', function (data) {
            $('#players').html(data.length);
        });

        socket.on('new-user-connected', function (data) {
            $('#players').html(data.length);
        });

        socket.on('start', function () {
            console.log('started');
        });

        socket.on('stop', function () {
            console.log('stop');
        });

        $('#start').bind('click mouseout', function () {
            socket.emit('start');
        });

    };

    $('#connect').bind('click', function () {
        bind();
    });

});
