$(function() {
    var socket = io();

    socket.emit('fetch rooms');
    socket.on('show rooms', function(data){
        $.each(data, function(i, r){ 
            $('#rooms').append('<tr><td><a href="/room/' + r.title + '">' + r.title + '</a></td><td>[<a href="/qrcode/'+ r.title +'">二维码</a>]</td></tr>');
        });
    });
});
