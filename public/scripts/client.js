$(document).ready(function () {

    var socket;
    var audio = new Audio('rock-and-roll-music.mp3');

    var bind = function () {

        socket = io.connect(window.location.origin);

        socket.on('connect', function (data) {
            $('html').css('background-color', 'gray');
            socket.emit('new-user');
        });

        socket.on('user-desconnected', function (data) {
            $('#players').html(data.length);
        });

        socket.on('new-user-connected', function (data) {
            $('#players').html(data.length);
        });

        socket.on('start', function () {
            // audio.currentTime = 0;
            audio.play();
            $('#notMe').css('display', 'inline-block');
            $('#gameOver, #youLose').hide();
        });

        socket.on('stop', function () {
            audio.pause();
            $('#notMe').hide();
            $('#gameOver').show();
        });

        socket.on('change-color', function (data) {
            $('html').css('background-color', data.color);
            if (data.color === 'black') {
                $('#youLose').show();
            }
        });

        $('#notMe').bind('click mouseout', function () {
            $('html').css('background-color', 'gray');
            socket.emit('not-me', {not: 'me'});
        });
    };

    $('#wantPlay').bind('click', function () {
        bind();
        $('#wantPlay').hide();
    });

});
