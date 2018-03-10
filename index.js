/*var express = require('express');

var fs = require("fs");

var privateKey  = fs.readFileSync('encryption/.private.key');
var certificate = fs.readFileSync('encryption/.mydomain.csr');

var credentials = {key: privateKey, cert: certificate};


var app = express();
var http = require('http').Server(app);
var https = require('https');
var path = require('path');
var http = require('http').Server(app);
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var scrypt = require('js-scrypt');
var sha256 = require('sha256');
var request = require("request");

const tls = require('tls');
//var io = require('socket.io')(http);
var secure_socket = tls.

app.use(express.static(path.join(__dirname, 'public')));*/

////////////////////////////////////////////////////////////////////
var express = require('express');
var fs = require("fs");

var app = express();
var http = require('http').Server(app);
var https = require('https');
var path = require('path');
var http = require('http').Server(app);
var mysql = require('mysql');
var sha256 = require('sha256');
var request = require("request");

var io = require('socket.io')(http);

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
var sslPath = "certs/"

var options = {
    key: fs.readFileSync(sslPath + 'privkey.pem'),
    cert: fs.readFileSync(sslPath + 'fullchain.pem')
};
var server = https.createServer(options, app);
var io = require('socket.io')(server);

server.listen(3000, function() {
    console.log('server up and running at %s port', 3000);
});


//listener function is listener for 'secureConnection' event
    io.sockets.on('chat message', function(msg){
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
    io.sockets.on('disconnect', function(){
        console.log('user disconnected');
    });
    io.sockets.on('connection', function(userName) {
        console.log("User connected");
    });
io.on('connection2', function(userName) {
    console.log("User connected2");
});
    io.sockets.on('userNameSend', function(userName){
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

    //catch verifyToken event emitted on google login
    io.sockets.on('verifyToken', function(token){
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
                socket.emit("authFailureAppDiscrepancy","Bad! No Hacking!");
            }
			console.log(email);
            var hash = sha256(email);
            console.log(hash);

            write = mysql.createConnection({
                host: host,
                user: writeUN,
                password: writePW,
                database: database,
            });
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
                    io.sockets.on('identifyMyself', function (whoIAm) {
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
                    userName = userName.substr(0,userName.length-1);
                    console.log(result[0].username);
                    socket.emit("authSuccess",userName);
                }
            });
        });

    });

	//Add Friend button is pushed; called by currentUser adding friendToAdd
	io.sockets.on('addFriend', function (currentUser, friendToAdd) {
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
//var httpsServer = https.createServer(credentials, app);
//httpsServer.listen(8443);

/*http.listen(3000, function(){
    console.log('listening on *:3000');
});*/


