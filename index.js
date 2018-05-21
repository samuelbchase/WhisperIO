
////////////////////////////////////////////////////////////////////
var express = require('express');
var app = require('express')();
var fs = require("fs");
var http = require('http').Server(app);
var https = require('https');
var path = require('path');
var mysql = require('mysql');
var sqlstr = require('sqlstring');
var sha256 = require('sha256');
var request = require("request");
var socket_io = require("socket.io");
var NodeRSA = require('node-rsa');
var randomstring = require("randomstring");

const tls = require('tls');

app.use(express.static(path.join(__dirname, 'public')));
/////////////////////////////////////////////////////////////////////

// Not sure if this is proper
//gulp.task('travis', ['build', testServerJS'], function () {
//   process.exit(0);
//};


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

var key;
var contents = fs.readFileSync('.privkey','utf8');
key = new NodeRSA(contents);

var mysql2 = require('sync-mysql');

var syncConnRead;
var syncConnWrite;

function getToken(userName) {
    var sql = "";
    const result = syncConnRead.query(sql);
    console.log("Token is" + result[0].token) ;
}
//use this for opening a file for the read and write passwords for the DB	
//PLEASE DON'T MESS WITH THIS FUNCTION OR .info.txt! IT WILL SCREW UP THE DATABASE QUERIES
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

    syncConnRead = new mysql2({
        host: host,
        user: readUN,
        password: readPW,
        database: database
    });
    syncConnWrite = new mysql2({
        host: host,
        user: writeUN,
        password: writePW,
        database: database
    });
});
var sslPath = "certs/";

var options = {
    key: fs.readFileSync(sslPath + 'privkey.pem'),
    cert: fs.readFileSync(sslPath + 'fullchain.pem')
};


// ***********************************
//              myServer
//  use myServer.getInstance() to get
//  a singleton instance of a server
// ***********************************
var myServer = (function () {

    var instance;

    function init () {
        console.log("---Server initializing---");
        return https.createServer(options, app);
    }

    return {

        // Get the Singleton instance if one exists
        // or create one if it doesn't
        getInstance: function () {

            if ( !instance ) {
                instance = init();
            }
            return instance;
        }
    }
}) ();


var server = myServer.getInstance();
var io = require('socket.io')(server);


server.listen(3000, function() {
    console.log('server up and running at %s port', 3000);
});

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
        socket.emit("tokenVerifyRequest","");
        socket.on('tokenVerifyAnswer', function(token) {
            if(token === syncConnRead.query(sqlstr.format("SELECT token FROM User where username = ?;",[userName]))[0].token) {
                userName = userName.toLowerCase();
                console.log(userName + " is logging in");
                sql = sqlstr.format("UPDATE User SET isOnline='Y' WHERE username=?;", [userName]);
                write.query(sql, function (err) {
                    if (err) throw err;
                });            }
        });
    });

    socket.on('chat message', function(msg){
        console.log("Chat message request received");
        var indexOfSeparator = msg.indexOf('-');
        var userSentTo = msg.slice(0,indexOfSeparator);
        userSentTo = userSentTo.toLowerCase();
        var message = msg.slice(indexOfSeparator+1);
        socket.emit("tokenVerifyRequest","");
        socket.once('tokenVerifyAnswer', function(token) {
            console.log("Processing chat message token");
            //TODO fix hardcode "sam"
            var name = "Unknown";
            for(var i = 0; i < sockets.length;i++)
            {
                if(sockets[i] === socket)
                {
                    name = names[i];
                }
            }
            if(token === syncConnRead.query(sqlstr.format("SELECT token FROM User where username = ?;", name))[0].token) {
                console.log('message: ' + message);
                console.log('Was set to: ' + userSentTo);


                for(var j = 0; j < sockets.length;j++)
                {
                    if(names[j] === userSentTo)
                    {
                        const sendSocket = sockets[j];
                        //Sends message to the specified user
                        sendSocket.emit("tokenVerifyRequest","");
                        sendSocket.once('tokenVerifyAnswer', function(token) {
                            var tok = syncConnRead.query(sqlstr.format("SELECT token FROM User where username = ?;", [userSentTo]));
                            tok = tok[0].token;
                            if(token === tok) {
                                sendSocket.emit('chat message',name + "-" + message);
                            }
                            else {
                                console.log("Token error on receiver");
                            }
                        });
                    }
                }
                console.log('By: ' + name);
                sql = "INSERT INTO Message (SentFrom, SentTo, Message, timestamp) VALUES ('" + name + "', '" + userSentTo + "', '" + key.encrypt(message, 'base64') + "', FROM_UNIXTIME('" + Date.now()/1000 + "'));";
                console.log(sql);
                write.query(sql, function(err, result) {
                    if (err) throw err;
                });
            }
        });
        });

    socket.on('disconnect', function(){
        console.log(this.id + " is logging out");
        sql = sqlstr.format("UPDATE User SET isOnline='N' WHERE username= ?;", [this.id]);
        write.query(sql, function (err) {
            if (err) throw err;
        });
    });

    socket.on('chathistory', function (name, from) {
        //to make this better
        sql = "SELECT * FROM Message WHERE (SentFrom, SentTo) = ('" + name + "', '" + from + "') OR (SentTo, SentFrom) = ('" + name + "', '" + from + "') ORDER BY timestamp ASC;";
        read.query(sql, function(err, result){
            if(err)
                throw err;
	    for(var x in result)
		{
			result[x].Message = key.decrypt(result[x].Message,'utf8');
		}
		socket.emit("tokenVerifyRequest","");
            socket.on('tokenVerifyAnswer', function(token) {
                if(token === syncConnRead.query(sqlstr.format("SELECT token FROM User where username = ?;", [name])[0].token)) {
                    socket.emit('messageHistory', result);
                }

            });
        });

    });


    socket.on('userNameSend', function(userName){
        sockets.push(socket);
        names.push(userName);
        socket.id = userName;
        console.log("New User Connected: " + socket.id);
        socket.emit("tokenVerifyRequest","");
        socket.once('tokenVerifyAnswer', function(token) {
            console.log("Answer Received");
            console.log("Token is: " + syncConnRead.query(sqlstr.format("SELECT token FROM User where username = ?;", [userName]))[0].token);
            if(token === syncConnRead.query(sqlstr.format("SELECT token FROM User where username = ?;", [userName])[0].token) {
                var sql = "SELECT * FROM Friends where Host = ?;", [userName]);
                read.query(sql, function (err, result) {
                    console.log("Emitting friends list to " + userName);
                    if (err) throw err;
                    //console.log("Broadcasting friends to " + userName);
                    console.log("----------------------------");
                    socket.emit('FriendsList',result);
                    //console.log("Friends list sent: " + result);
                });
            }
            else {
                console.log("Token failure in userNameSend")
            }
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
            var hash = sha256(email);

            var sql = sqlstr.format("SELECT username FROM User WHERE emailHash = ?;", [hash]);
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
                        const tok = randomstring.generate(255);
                        var insertSQL = "INSERT INTO User (userName,emailHash,token) VALUES('" + whoIAm.toLowerCase() + "','" + hash + "', '" + tok + "');";
                        write.query(insertSQL, function(err, result) {
                            if (err) throw err;
                        });
                        console.log(tok);
                        var user = {name: whoIAm.toLowerCase(), token: tok};
                        socket.emit("authSuccessNewUser", user);
                    });
                }
                //if user exists, authenticate them
                else
                {
                    var userName = result[0].username;
                    userName = userName.substr(0,userName.length);
                    const newTok = randomstring.generate(255);
                    syncConnWrite.query(sqlstr.format("UPDATE User set token = ? WHERE username = ?;", [newTok, userName]));
                    console.log("Sending token: " + newTok);
                    var user = {name: userName, token: newTok};
                    socket.emit("authSuccess",user);
                }
            });
        });

    });
	
	socket.on('isOnline', function(user) {
        var sql = sqlstr.format("SELECT isOnline FROM User WHERE username = ?;", [user]);
        read.query(sql, function(err, result) {
           if (err) throw err;
           if (result[0].isOnline === 'Y')
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
			if (result.length === 0) // if the friend relationship doesn't exist
			{
				console.log("New friend!");
				
				sql = "SELECT * FROM User WHERE username = \"" + friendToAdd + "\";";
				read.query(sql, function(err, result) {	
					if (err) throw err;
					if (result.length > 0)	// make sure that the friend you're adding actually exists
					{
					    currentUser = currentUser.toLowerCase();
                        friendToAdd = friendToAdd.toLowerCase();

                        sql = "INSERT INTO Friends (Host, Receiver) VALUES ('" + currentUser.toLowerCase() + "', '" + friendToAdd.toLowerCase() + "');";
						write.query(sql, function(err, result) {
							if (err) throw err;
						});
						console.log(friendToAdd.toLowerCase() + " was added");
                        socket.emit('addFriendResult', 1, friendToAdd.toLowerCase());
					}
					else {
                        console.log("User does not exist!");
                        socket.emit('addFriendResult', -1, friendToAdd.toLowerCase());
					}
				});
			}
			else {
                console.log("Friend already exists")
                socket.emit('addFriendResult', 0, friendToAdd);
            }
		});
	});

    socket.on('removeFriend', function (user, friend) {
        console.log("Removing " + friend + " for " + user + " as a friend");

        //check to see if the friend relationship already exists
        var sql = sqlstr.format("SELECT * FROM User WHERE username = ?;", [friend]);
        read.query(sql, function(err, result) {
            if (err) throw err;
            if (result.length === 1) // if the user exists
            {
                console.log("User exists!");

                sql = "SELECT * FROM Friends WHERE Host = \"" + user + "\" AND Receiver = \"" + friend + "\";";
                read.query(sql, function(err, result) {
                    if (err) throw err;
                    if (result.length > 0)	// make sure that the friend you're removing has a friend relationship
                    {
                        sql = "DELETE FROM Friends WHERE (Host, Receiver) = ('" + user + "', '" + friend + "');";
                        write.query(sql, function(err, result) {
                            if (err) throw err;
                        });
                        console.log(friend + " was removed");
                        socket.emit('removeFriendResult', 1, friend);
                    }
                    else {
                        console.log("Friend relationship does not exist");
                        socket.emit('removeFriendResult', 0, friend);
                    }
                });
            }
            else {
                console.log("User does not exist");
                socket.emit('removeFriendResult', -1, friend);
            }
        });
    });

    socket.on('deleteAccount', function(userName) {
        socket.emit("tokenVerifyRequest","");
        socket.once('tokenVerifyAnswer', function(token) {
            console.log("Answer Received");
            if(token === syncConnRead.query("SELECT token FROM User where username = '" + userName + "';")[0].token) {
                var sql = "SELECT * FROM User WHERE username = \"" + userName + "\";";
                read.query(sql, function(err, result) {
                    if (err) throw err;
                    if (result.length !== 0) {
                        console.log("user found - deleting " + result[0].username);
                        sql = "DELETE FROM Message WHERE SentFrom = \"" + result[0].username + "\" OR SentTo = \"" + result[0].username + "\";";
                        write.query(sql, function(err) {
                            if (err) throw err;
                        });
                        sql = "DELETE FROM Friends WHERE Host = \"" + result[0].username + "\" OR Receiver = \"" + result[0].username + "\";";
                        write.query(sql, function(err) {
                            if (err) throw err;
                        });
                        sql = "DELETE FROM User WHERE username = \"" + result[0].username + "\";";
                        write.query(sql, function(err) {
                            if (err) throw err;
                        });
                    }
                    else
                    {
                        console.log("this really shouldn't happen...");
                    }
                });
            }
            else {
                console.log("Token failure in deleteAccount")
            }
        });

    });
});


//var httpsServer = https.createServer(credentials, app);
//httpsServer.listen(8443);
