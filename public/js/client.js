$(function () {
    let socket = io();
    let onlineusers = {};
    let username = '';
    let cookiename = 'socketio-chat-username'

    function addChatMessage (usrname, time, msg) {
      let usernameDiv    = $('<span class="username"/>').text(usrname).css('color', onlineusers[usrname]);
      let timeDiv        = $('<br><span class="timestamp"/>').text(time).css('font-size', 'small');
      let messageBodyDiv = $('<span class="mesgtext">').text(msg);
      if (usrname === username) messageBodyDiv.css('font-weight', 'bold');
      let messageDiv     = $('<li class="mesg"/>').data('username', usrname).append(usernameDiv, messageBodyDiv, timeDiv);

      // Append to chat
      $('#messages').append(messageDiv);
      // Update scrollbar
      let element = document.getElementById("messagelist");
      element.scrollTop = element.scrollHeight;
    }

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
      $('#messages').empty();
      for (msg of messages) {
        let usrname = msg[0];
        let time = msg[1];
        let msgtext = msg[2];
        addChatMessage(usrname, time, msgtext);
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
      addChatMessage(usrname, time, msg);
    });

    socket.on('error_mesg', function(mesg){
      alert(mesg);
    });
});