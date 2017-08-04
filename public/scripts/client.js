$(document).ready(function () {

    var socket;
    var audio = document.createElement('audio');
    audio.src = 'http://85.144.18.196/mp3/dnb/Omni_Trio/Even_Angels_Cast_Shadows_2001/08. omni trio - lucid.mp3';

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

        socket.on('start', function (data) {
            audio.currentTime = 0;
            audio.play();
            $('#notMe').css('display', 'inline-block');
            $('#showTrack, #gameOver').hide();
        });

        socket.on('stop', function (data) {
            audio.pause();
            $('#notMe').hide();
            $('#showTrack').show();
        });

        socket.on('change-color', function (data) {
            $('html').css('background-color', data.color);
            if (data.color === 'black') {
                $('#gameOver').show();
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
