   $(document).ready(function(){
    //initialize io 
    var socket = io();

    //get user
    var user = prompt('Please enter your name');
        if(user != null){
            socket.emit('user', user)
        }

    //get form element
    $('form').submit(function(){
      //send chat message
      socket.emit('chat message', $('#m').val());
      //empty the input 
      $('#m').val('');
      return false;
    });
    
    //show the message inside div #messages
    socket.on('chat message', function(msg){
      $('#messages').append($('<li>').text(msg));
    });

    //show typing when a key is pressed
    $("#m").on("keyup", function (event) {
      //send typing
      socket.emit("typing", {
         name: user
      });
    });
    
    //show typing inside div #status
    socket.on("typing", function (data) {
      $("#status").html(data.name + " is typing");
      //empty the status div after 3 sec
       setTimeout(function () {
          $("#status").html('');
            }, 3000);
       });
  
  });



