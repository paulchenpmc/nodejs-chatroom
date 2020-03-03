var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
    res.sendFile(__dirname + 'index.html');
});

io.on('connection', function(socket) {
    console.log('New user connected...');
    socket.on('disconnect', function(){
        console.log('User disconnected...');
    });
});

http.listen(3000, function() {
    console.log('Listening on *:3000');
});