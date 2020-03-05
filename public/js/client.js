$(function () {
    let socket = io();
    let onlineusers = {};
    let username = '';
    let cookiename = 'socketio-chat-username'

    socket.on('connect', function () {
      // Check if username cookie exists on connect
      if (document.cookie.split(';').filter((item) => item.trim().startsWith(cookiename + '=')).length) {
        // If username exists, use that username
        let usrname = document.cookie.replace(/(?:(?:^|.*;\s*)socketio-chat-username\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        socket.emit('chat message', '/nick ' + usrname);
      }
    });

    socket.on('your_username', function(usrname){
      username = usrname;
      document.cookie = cookiename + '=' + usrname;
      $('#username').text(username);
    });

    socket.on('current_users', function(users){
      $('#onlineusers').empty();
      onlineusers = users;
      for (const user of Object.keys(users)) {
        let listitem = $('<li>');
        listitem.text(user)
        listitem.css('color', onlineusers[user]);
        $('#onlineusers').append(listitem);
      }
    });

    socket.on('message_history', function(messages){
      for (msg of messages) {
        let usrname = msg[0];
        let time = msg[1];
        let msgtext = msg[2];
        let listitem = $('<li>');
        listitem.text(usrname + ' ' + time + ': ' + msgtext)
        listitem.css('color', onlineusers[usrname]);
        if (usrname === username) listitem.css('font-weight', 'bold');
        $('#messages').append(listitem);
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
      let listitem = $('<li>');
      listitem.text(usrname + ' ' + time + ': ' + msg)
      listitem.css('color', onlineusers[usrname]);
      if (usrname === username) listitem.css('font-weight', 'bold');
      $('#messages').append(listitem);
      // Update scrollbar
      let element = document.getElementById("messagelist");
      element.scrollTop = element.scrollHeight;
    });

    socket.on('error_mesg', function(mesg){
      alert(mesg);
    });
});