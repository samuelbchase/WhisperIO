var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var http = require('http').Server(app);
var mysql = require('mysql');

var io = require('socket.io')(http);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.get('/login', function(req, res){
    res.sendFile(__dirname + '/login.html');
});

var sockets = [];
var names = [];

io.on('connection', function(socket){
    socket.on('chat message', function(msg){

        var indexOfSeparator = msg.indexOf('-');
        var userSentTo = msg.slice(0,indexOfSeparator);
        var message = msg.slice(indexOfSeparator+1);
        console.log("----------------------------");
        console.log('message: ' + message);
        console.log('Was set to: ' + userSentTo);
        var name = "Unknown";
        for(var i = 0; i < sockets.length;i++)
        {
            if(sockets[i] === socket)
            {
                name = names[i];
                console.log(name + ' connected');
            }
        }
        console.log('By: ' + name);
        console.log("----------------------------");
        socket.broadcast.to(name).emit('chat message',message);
    });
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
    socket.on('userNameSend', function(userName){
        sockets.push(socket);
        names.push(userName);
        console.log("UserNameSend sent: " + userName);
            var con = mysql.createConnection({
                host: "hardworlder.com",
                user: "readOnlyWhisper",
                password: "Einherjar255!",
                database: "whisperio"
            });
            var sql = "SELECT * FROM Friends where Host = '" + userName + "';";
            con.query(sql, function (err, result) {
                if (err) throw err;
                socket.broadcast.to(userName).emit('FriendsList',result);
                console.log("Friends list sent: " + result);
            });
            con.end()
    });

});

http.listen(3000, function(){
    console.log('listening on *:3000');
});
