const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');

let current_users = {};
let message_history = [];
let slash_command_re = /^\/(.+) (.+)$/i;
let command_color_re = /^(\w\w\w\w\w\w)$/i;

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
        let slash_command_match = msg.match(slash_command_re);
        if (slash_command_match) {
            // Special slash command
            let slash_command = slash_command_match[1];
            let command_value = slash_command_match[2];
            if (slash_command.toLowerCase() === 'nick') {
                let new_username = command_value;
                if (!(new_username in current_users)) {
                    // Change nickname for user
                    console.log(username + ' changed to ' + new_username);
                    let clr = remove_username(username);
                    username = new_username;
                    current_users[username] = clr;
                    socket.emit('your_username', username);
                    io.emit('current_users', current_users);
                    socket.emit('message_history', message_history);
                } else {
                    // Send error mesg to user
                    socket.emit('error_mesg', 'Error, tried to set username to existing online user...');
                }
            } else if (slash_command.toLowerCase() === 'nickcolor') {
                // Check for valid color
                let color_command_match = command_value.match(command_color_re);
                if (color_command_match) {
                    // Change nickname color for user
                    let new_color = color_command_match[1];
                    current_users[username] = '#' + new_color;
                    io.emit('current_users', current_users);
                } else {
                    // Send error mesg to user
                    socket.emit('error_mesg', 'Error, please format color in HEX in the form: /nickcolor RRGGBB');
                }
            } else {
                // Invalid slash command, send error mesg to user
                socket.emit('error_mesg', 'Error, invalid slash command...');
            }
        } else {
            // Regular mesg
            let now = new Date();
            let time = now.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
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