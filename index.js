const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');
let current_users = [];
let message_history = [];

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
    res.sendFile(__dirname + 'index.html');
});

io.on('connection', function(socket) {
    let username = uniqueNamesGenerator({ dictionaries: [adjectives, adjectives, animals] });
    console.log(username + ' connected...');
    current_users.push(username);
    socket.emit('your_username', username);
    socket.emit('message_history', message_history);
    io.emit('current_users', current_users);

    socket.on('chat message', function(msg){
        let now = new Date();
        let time = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
        if (message_history.length >= 200) message_history.shift();
        message_history.push([username, time, msg]);
        io.emit('chat message', username, time, msg);
    });

    socket.on('disconnect', function(){
        console.log(username + ' disconnected...');
        let index = current_users.indexOf(username);
        if (index !== -1) current_users.splice(index, 1);
        io.emit('current_users', current_users);
    });
});

http.listen(3000, function() {
    console.log('Listening on *:3000');
});