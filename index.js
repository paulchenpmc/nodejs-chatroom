const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');

let current_users = {};
let message_history = [];
let command_nickname_re = /^\/nick (.+)$/i;
let command_color_re = /^\/nickcolor (\w\w\w\w\w\w)$/i;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
    res.sendFile(__dirname + 'index.html');
});

function remove_username(usrname) {
    let clr = current_users[usrname];
    delete current_users[usrname];
    return clr;
}

io.on('connection', function(socket) {
    let username = uniqueNamesGenerator({ dictionaries: [adjectives, adjectives, animals] });
    let randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
    console.log(username + ' connected...');
    current_users[username] = randomColor;
    socket.emit('your_username', username);
    io.emit('current_users', current_users); // Assume this occurs before message_history below for chat coloring
    socket.emit('message_history', message_history);

    socket.on('chat message', function(msg){
        let nickname_command_match = msg.match(command_nickname_re);
        let color_command_match = msg.match(command_color_re);
        if (nickname_command_match) {
            let new_username = nickname_command_match[1];
            if (!(new_username in current_users)) {
                // Change nickname for user
                console.log(username + ' changed to ' + new_username);
                let clr = remove_username(username);
                username = new_username;
                current_users[username] = clr;
                socket.emit('your_username', username);
                io.emit('current_users', current_users);
            }
        } else if (color_command_match) {
            // Change nickname color for user
            let new_color = color_command_match[1];
            current_users[username] = '#' + new_color;
            io.emit('current_users', current_users);
        }
        else {
            // Regular mesg
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