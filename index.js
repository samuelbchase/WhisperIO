var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var http = require('http').Server(app);
var mysql = require('mysql');

var io = require('socket.io')(http);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/main', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.get('/', function(req, res){
    res.sendFile(__dirname + '/login.html');
});

var sockets = [];
var names = [];
var read;
var write;

var fs = require("fs");
var host;
var database;
var readUN;
var readPW;
var writeUN;
var writePW;

//use this for opening a file for the read and write passwords for the DB	
//PLEASE DON'T MESS WITH THIS FUNCTION OR .info.txt! IT WILL SCREW UP THE DATABASE QUERYS
fs.readFile('.info.txt', 'utf8', function(err, contents){
	var index = contents.indexOf('|');
	var old = 0;
	host = contents.slice(old, index);

	old = index + 3;
	index = contents.indexOf('|', old);
	database = contents.slice(old, index);

	old = index + 3;
	index = contents.indexOf('|', old);
	readUN = contents.slice(old, index);

	old = index + 3;
	index = contents.indexOf('|', old);
	readPW = contents.slice(old, index);

	old = index + 3;
	index = contents.indexOf('|', old);
	writeUN = contents.slice(old, index);

	old = index + 3;
	index = contents.indexOf('|', old);
	writePW = contents.slice(old);
});

io.on('connection', function(socket){
    socket.on('chat message', function(msg){
        var indexOfSeparator = msg.indexOf('-');
        var userSentTo = msg.slice(0,indexOfSeparator);
        var message = msg.slice(indexOfSeparator+1);
        console.log('message: ' + message);
        console.log('Was set to: ' + userSentTo);
	write = mysql.createConnection({
		host: host,
		user: writeUN,
		password: writePW,
		database: database,
	});
        var name = "Unknown";
        for(var i = 0; i < sockets.length;i++)
        {
            if(sockets[i] === socket)
            {
                name = names[i];
            }
        }
        for(i = 0; i < sockets.length;i++)
        {
            if(names[i] === userSentTo)
            {
                //Sends message to the specified user
                sockets[i].emit('chat message',name + "-" + message);
            }
        }
        console.log('By: ' + name);
        sql = "INSERT INTO Message (SentFrom, SentTo, Message, timestamp) VALUES ('" + name + "', '" + userSentTo + "', '" + message + "', FROM_UNIXTIME('" + Date.now()/1000 + "'));";
        console.log(sql);
        write.query(sql, function(err, result) {
            if (err) throw err;
        });
        console.log("----------------------------");
    });
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
    socket.on('tokenVerify', function(){
        console.log('Received Token');
    });

    socket.on('userNameSend', function(userName){
        sockets.push(socket);
        names.push(userName);
        socket.id = userName;
        console.log("New User Connected: " + socket.id);
		read = mysql.createConnection({
			host: host,
			user: readUN,
			password: readPW,
			database: database
		});
        var sql = "SELECT * FROM Friends where Host = '" + userName + "';";
        read.query(sql, function (err, result) {
            if (err) throw err;
            //console.log("Broadcasting friends to " + userName);
            console.log("----------------------------");
            socket.emit('FriendsList',result);
            //console.log("Friends list sent: " + result);
        });
		read.end();
    });
	
	//Add Friend button is pushed; called by currentUser adding friendToAdd
	socket.on('addFriend', function (currentUser, friendToAdd) {
		console.log("Adding " + friendToAdd + " for " + currentUser + " as a friend");
		read = mysql.createConnection({
			host: host,
			user: readUN,
			password: readPW,
			database: database
		});
		
		//check to see if the friend relationship already exists
		var sql = "SELECT * FROM Friends WHERE Host = \"" + currentUser + "\" AND Receiver = \"" + friendToAdd + "\";"
		read.query(sql, function(err, result) {
			if (err) throw err;
			if (result.length === 0) // if the friend relationship doesn't exist
			{
				console.log("New friend!");
				
				sql = "SELECT * FROM User WHERE username = \"" + friendToAdd + "\";"
				read.query(sql, function(err, result) {	
					if (err) throw err;
					if (result.length > 0)	// make sure that the friend you're adding actually exists
					{
						write = mysql.createConnection({
							host: host,
							user: writeUN,
							password: writePW,
							database: database,
						});
						sql = "INSERT INTO Friends (Host, Receiver) VALUES ('" + currentUser + "', '" + friendToAdd + "');"
						write.query(sql, function(err, result) {
							if (err) throw err;
						});
					}
					else
						console.log("User does not exist!");
				});
			}
			else console.log("Friend already exists");
		});
	});
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});
