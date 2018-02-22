var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var http = require('http').Server(app);
var mysql = require('mysql');

var io = require('socket.io')(http);

app.use(express.static(path.join(__dirname, 'public')));


var con = mysql.createConnection({
    host: "hardworlder.com",
    user: "readOnlyWhisper",
    password: "Einherjar255!",
    database: "whisperio"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    var sql = "SELECT * FROM Friends where Host = " + "'Sam';";
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Result: " + result);
    });
});

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    console.log('a user connected');
});

io.on('connection', function(socket){
    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });
});

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});

io.on('connection', function(socket){
    socket.on('chat message', function(msg){
        console.log('message: ' + msg);
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});
