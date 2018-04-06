
////////////////////////////////////////////////////////////////////
var express = require('express');
var app = require('express')();
var fs = require("fs");
var http = require('http').Server(app);
var https = require('https');
var path = require('path');
var mysql = require('mysql');
var sha256 = require('sha256');
var request = require("request");
var socket_io = require("socket.io");
const tls = require('tls');

app.use(express.static(path.join(__dirname, 'public')));
/////////////////////////////////////////////////////////////////////

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
var sslPath = "certs/";

var options = {
    key: fs.readFileSync(sslPath + 'privkey.pem'),
    cert: fs.readFileSync(sslPath + 'fullchain.pem')
};
//var server = https.createServer(options, app);
var server = https.createServer(options, app);
var io = require('socket.io')(server);
exports.listen = function() {
    app.listen(80);
};

io.on('connection', function(socket) {

    read = mysql.createConnection({
        host: host,
        user: readUN,
        password: readPW,
        database: database
    });
    write = mysql.createConnection({
        host: host,
        user: writeUN,
        password: writePW,
        database: database,
    });

    socket.on('userLogin', function (userName) {
       console.log(userName + " is logging in");
        sql = "UPDATE User SET isOnline='Y' WHERE username='" + userName + "';"
        write.query(sql, function (err) {
            if (err) throw err;
        });
    });

    socket.on('chat message', function(msg){
        var indexOfSeparator = msg.indexOf('-');
        var userSentTo = msg.slice(0,indexOfSeparator);
        var message = msg.slice(indexOfSeparator+1);
        console.log('message: ' + message);
        console.log('Was set to: ' + userSentTo);

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
        console.log(this.id + " is logging out");
        sql = "UPDATE User SET isOnline='N' WHERE username='" + this.id + "';"
        write.query(sql, function (err) {
            if (err) throw err;
        });
    });


    socket.on('chathistory', function (name, from) {
        //to make this better 
        console.log(name);
        console.log(from);
        sql = "SELECT * FROM Message WHERE (SentFrom, SentTo) = ('" + name + "', '" + from + "') OR (SentTo, SentFrom) = ('" + name + "', '" + from + "') ORDER BY timestamp ASC;";
        read.query(sql, function(err, result){
            if(err)
                throw err; 

            /* for var x in result {
                console.log(result[x].name/message/etc)
            }
            */
            socket.emit('messageHistory', result); 
        });

    });


    socket.on('userNameSend', function(userName){
        console.log("Sending Username");
        sockets.push(socket);
        names.push(userName);
        socket.id = userName;
        console.log("New User Connected: " + socket.id);
        var sql = "SELECT * FROM Friends where Host = '" + userName + "';";
        read.query(sql, function (err, result) {
            if (err) throw err;
            //console.log("Broadcasting friends to " + userName);
            console.log("----------------------------");
            socket.emit('FriendsList',result);
            //console.log("Friends list sent: " + result);
        });
    });

    //catch verifyToken event emitted on google login
    socket.on('verifyToken', function(token){
        console.log("token: " + token);
        var options = { method: 'GET',
            url: 'https://www.googleapis.com/oauth2/v3/tokeninfo',
            qs: { id_token: token},
            headers:
                { 'Postman-Token': 'cdeb0bf8-56b1-4a8d-b7cc-08cfb1eaa41d',
                    'Cache-Control': 'no-cache' } };

        request(options, function (error, response, body) {
            //parse request body
            if (error) throw new Error(error);
            body2 = JSON.parse(JSON.stringify(body));

            //parse body for API key
            var audLocation = body.indexOf('aud'); // => 18
            var aud = body.substring(audLocation, body.length);
            aud = aud.substring(aud.indexOf('"'), aud.length);
            aud = aud.substring(aud.indexOf('"')+1, aud.length);
            aud = aud.substring(aud.indexOf('"')+1, aud.length);
            aud = aud.substring(0, aud.indexOf('"'));

            //parse body for user email
            var emailLocation = body2.indexOf('email'); // => 18
            var email = body.substring(emailLocation, body.length);
            email = email.substring(email.indexOf('"'), email.length);
            email = email.substring(email.indexOf('"')+1, email.length);
            email = email.substring(email.indexOf('"')+1, email.length);
            email = email.substring(0, email.indexOf('"'));
            if(aud !== "521002119514-k8kp3p42fpoq7ia5868k9s9e62bj87n3.apps.googleusercontent.com")
            {
                //If you're attempting to login with a token for another app
                socket.emit("authFailureAppDiscrepancy","Bad! No Hacking!");
            }
            console.log(email);
            var hash = sha256(email);
            console.log(hash);

            var sql = "SELECT username FROM User where emailHash = '" + hash + "';";
            //if user doesn't exist add them
            write.query(sql, function (err, result) {
                if (err) throw err;
                var output = -1;
                if(result.length === 0)
                {
                    //emit unknownPerson request for first time user account creation on the front end
                    socket.emit("unknownPerson","whoU");
                    //handle new user info emitted from the front end
                    socket.on('identifyMyself', function (whoIAm) {
                        //add the new user to the database
                        var insertSQL = "INSERT INTO User (userName,emailHash) VALUES('" + whoIAm + "','" + hash + "');";
                        write.query(insertSQL, function(err, result) {
                            if (err) throw err;
                        });
                        socket.emit("authSuccessNewUser",whoIAm);
                    });
                }
                //if user exists, authenticate them
                else
                {
                    var userName = result[0].username;
                    userName = userName.substr(0,userName.length);
                    console.log(result[0].username);
                    socket.emit("authSuccess",userName);
                }
            });
        });

    });
	
	socket.on('isOnline', function(user) {
        var sql = "SELECT isOnline FROM User WHERE username='" + user + "';";
        read.query(sql, function(err, result) {
           if (err) throw err;
           if (result[0].isOnline == 'Y')
               socket.emit('isOnlineResult', true, user);
           else
               socket.emit('isOnlineResult', false, user);
        });
    });

    //Add Friend button is pushed; called by currentUser adding friendToAdd
	socket.on('addFriend', function (currentUser, friendToAdd) {
		console.log("Adding " + friendToAdd + " for " + currentUser + " as a friend");

		//check to see if the friend relationship already exists
		var sql = "SELECT * FROM Friends WHERE Host = \"" + currentUser + "\" AND Receiver = \"" + friendToAdd + "\";"
		read.query(sql, function(err, result) {
			if (err) throw err;
			if (result.length == 0) // if the friend relationship doesn't exist
			{
				console.log("New friend!");
				
				sql = "SELECT * FROM User WHERE username = \"" + friendToAdd + "\";";
				read.query(sql, function(err, result) {	
					if (err) throw err;
					if (result.length > 0)	// make sure that the friend you're adding actually exists
					{
						sql = "INSERT INTO Friends (Host, Receiver) VALUES ('" + currentUser + "', '" + friendToAdd + "');";
						write.query(sql, function(err, result) {
							if (err) throw err;
						});
						console.log(friendToAdd + " was added");
                        socket.emit('addFriendResult', 1, friendToAdd);
					}
					else {
                        console.log("User does not exist!");
                        socket.emit('addFriendResult', 0, friendToAdd);
					}
				});
			}
			else {
                console.log("Friend already exists")
                socket.emit('addFriendResult', -1, friendToAdd);
            }
		});
	});
});



//var httpsServer = https.createServer(credentials, app);
//httpsServer.listen(8443);
