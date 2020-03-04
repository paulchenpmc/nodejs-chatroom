$(function () {
    let socket = io();
    let username = '';

    socket.on('your_username', function(usrname){
      username = usrname;
      $('#username').text(username);
    });

    socket.on('current_users', function(users){
      $('#onlineusers').empty();
      for (user of users) {
        $('#onlineusers').append($('<li>').text(user));
      }
    });

    socket.on('message_history', function(messages){
      for (msg of messages) {
        let usrname = msg[0];
        let time = msg[1];
        let msgtext = msg[2];
        $('#messages').append($('<li>').text(usrname + ' ' + time + ': ' + msgtext));
      }
    });

    $('form').submit(function(e){
      e.preventDefault(); // prevents page reloading
      if ($('#m').val() === '') return false;
      socket.emit('chat message', $('#m').val());
      $('#m').val('');
      return false;
    });

    socket.on('chat message', function(usrname, time, msg){
      tag = '<li>';
      if (usrname === username) tag += '<b>';
      $('#messages').append($(tag).text(usrname + ' ' + time + ': ' + msg));
      // Update scrollbar
      let element = document.getElementById("messagelist");
      element.scrollTop = element.scrollHeight;
    });
});