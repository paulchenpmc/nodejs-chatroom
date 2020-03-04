const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
    res.sendFile(__dirname + 'index.html');
});

io.on('connection', function(socket) {
    console.log('New user connected...');

    let username = uniqueNamesGenerator({ dictionaries: [adjectives, adjectives, animals] });

    socket.on('chat message', function(msg){
        let now = new Date();
        let time = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
        io.emit('chat message', username + '//' + time + '//' + msg);
    });

    socket.on('disconnect', function(){
        console.log('User disconnected...');
    });
});

http.listen(3000, function() {
    console.log('Listening on *:3000');
});