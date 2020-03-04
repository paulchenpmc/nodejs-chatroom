// https://stackoverflow.com/questions/18614301/keep-overflow-div-scrolled-to-bottom-unless-user-scrolls-up
function updateScroll(){
  let element = document.getElementById("messagelist");
  element.scrollTop = element.scrollHeight;
}

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
      updateScroll();
    });
});