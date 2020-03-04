const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');
let current_users = [];
let message_history = [];
let re = /\/nick (.+)/i;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
    res.sendFile(__dirname + 'index.html');
});

function remove_username(usrname) {
    let index = current_users.indexOf(usrname);
    if (index !== -1) current_users.splice(index, 1);
}

io.on('connection', function(socket) {
    let username = uniqueNamesGenerator({ dictionaries: [adjectives, adjectives, animals] });
    console.log(username + ' connected...');
    current_users.push(username);
    socket.emit('your_username', username);
    socket.emit('message_history', message_history);
    io.emit('current_users', current_users);

    socket.on('chat message', function(msg){
        match = msg.match(re);
        if (match) {
            new_username = match[1];
            if (!current_users.includes(new_username)) {
                console.log(username + ' changed to ' + new_username);
                remove_username(username);
                username = new_username;
                current_users.push(username);
                socket.emit('your_username', username);
                io.emit('current_users', current_users);
            }
        } else {
            let now = new Date();
            let time = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
            if (message_history.length >= 200) message_history.shift();
            message_history.push([username, time, msg]);
            io.emit('chat message', username, time, msg);
        }
    });

    socket.on('disconnect', function(){
        console.log(username + ' disconnected...');
        remove_username(username);
        io.emit('current_users', current_users);
    });
});

http.listen(3000, function() {
    console.log('Listening on *:3000');
});