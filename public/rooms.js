$(function() {
    var socket = io();

    socket.emit('fetch rooms');
    socket.on('show rooms', function(data){
        $.each(data, function(i, r){ 
            $('#rooms').append('<li><a href="/room/' + r.title + '">' + r.title + '</a></li>');
        });
    });
});
