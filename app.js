//get the required modules
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const http = require('http').Server(app);

//initialize socket.io lib
const io = require('socket.io')(http);

// routing
app.use(express.static('./client/'));
app.get('/', function(req, res){
    res.sendFile(__dirname+"/index.html")
})

//setup mongodb connection
var dbURI = 'mongodb://localhost/chat';
mongoose.connect(dbURI);
mongoose.connection.once('connected', function(){
    console.log(dbURI + ' Database connection established')
});
//setup finished

// define a schema
var Schema = mongoose.Schema;

// make instance of Schema
var chatSchema = new Schema({
    user        :       {type:String, default:''},
    message     :       {type:String},
    created     :       {type:Date, default:Date.now}

});

//deifne a model
var Chat = mongoose.model('Message', chatSchema);

//check socket.io connection
io.on('connection', function(socket){

  //when client emits "user", this listens and execute
  socket.on('user', function(data){

    //tell the client to execute 'chat message'
     socket.broadcast.emit('chat message', data+ " came online")
     socket.user = data;
  });

//when client emits "chat message", this listens and executes
  socket.on('chat message', function(msg){

    //store user and message in chatMsg variable
    var chatMsg = new Chat({user:socket.user, message:msg}); 

    //save the user and message to database
    chatMsg.save(function(err){
      if(err) {
        console.log(err)
      }else{
        //globally show the chat message
         io.emit('chat message', socket.user + ' : ' + msg);
      }
    })
    console.log(chatMsg)
  });

    //show typing when a user is typing
    socket.on("typing", function (data) {
        socket.emit("typing", data);
        socket.broadcast.emit("typing", data);
    });
  
  //show user left, when disconnected
  socket.on('disconnect', function(){
    socket.broadcast.emit('chat message', socket.user + " left")
  })


});

//listen on port
http.listen(3000, function(){
    console.log("app started")
})