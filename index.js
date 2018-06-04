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
var NodeRSA = require('node-rsa');
var randomstring = require("randomstring");
var bcrypt = require('bcrypt');
var io = require('socket.io')(http);
app.use('/scripts', express.static(__dirname + '/node_modules/sweetalert/dist/'));

const tls = require('tls');
const saltRounds = 10;

app.use(express.static(path.join(__dirname, 'public')));
/////////////////////////////////////////////////////////////////////

// Not sure if this is proper
//gulp.task('travis', ['build', testServerJS'], function () {
//   process.exit(0);
//};

function messageFactory(sentBy, text)
{
    if (sentBy === null || text === null)
    {
        return -1
    }
    if (sentBy === "" || text === "")
    {
        return -1
    }
    var message = new Object();
    message.sentBy = sentBy;
    message.text = text;
    return message;
}

app.get('/main', function(req, res)
{
    res.sendFile(__dirname + '/index.html');
});

app.get('/', function(req, res)
{
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
var contents = fs.readFileSync('.privkey', 'utf8');
key = new NodeRSA(contents);

var mysql2 = require('sync-mysql');

var syncConnRead;
var syncConnWrite;

function getToken(userName)
{
    var sql = "";
    var result = syncConnRead.query(sql);
    console.log("Token is" + result[0].token);
}
//use this for opening a file for the read and write passwords for the DB
//PLEASE DON'T MESS WITH THIS FUNCTION OR .info.txt! IT WILL SCREW UP THE
// DATABASE QUERYS
fs.readFile('.info.txt', 'utf8', function(err, contents)
{
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
    contents.indexOf('|', old);
    writePW = contents.slice(old);

    syncConnRead = new mysql2(
        {
            host: host,
            user: readUN,
            password: readPW,
            database: database
        });
    syncConnWrite = new mysql2(
        {
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
if (typeof debugMode !== "undefined")
{
    if (debugMode === 1)
    {
        exports.runServer = function()
        {
            http.listen(3001, function()
            {
                console.log('listening on *:3001');
            });
        };

        exports.closeServer = function()
        {
            http.close();
            console.log("server is closing");
        };
    }
}
else
{
    // ***********************************
    //              myServer
    //  use myServer.getInstance() to get
    //  a singleton instance of a server
    // ***********************************
    var myServer = (function()
    {

        var instance;

        function init()
        {
            console.log("---Server initializing---");
            return https.createServer(options, app);
        }

        return {

            // Get the Singleton instance if one exists
            // or create one if it doesn't
            getInstance: function()
            {

                if (!instance)
                {
                    instance = init();
                }
                return instance;
            }
        }
    })();


    var server = myServer.getInstance();
    io = require('socket.io')(server);


    server.listen(3000, function()
    {
        console.log('server up and running at %s port', 3000);
    });

}
io.on('connection', function(socket)
{

    read = mysql.createConnection(
        {
            host: host,
            user: readUN,
            password: readPW,
            database: database
        });
    write = mysql.createConnection(
        {
            host: host,
            user: writeUN,
            password: writePW,
            database: database,
        });

    socket.on('userLogin', function(userName, callback)
    {
        socket.emit("tokenVerifyRequest", "", function(token)
        {
            if (token === syncConnRead.query(
                "SELECT token FROM User where " +
                "username = '" + userName + "';")[0].token)
            {
                userName = userName.toLowerCase();
                console.log(userName + " is logging in");
                var sql =
                    "UPDATE User SET isOnline='Y' WHERE username='" +
                    userName + "';";
                write.query(sql, function(err)
                {
                    if (err) throw err;
                });
                return callback(0, userName + " logged in successfully");
            }
        });
        return callback(-1, "There was an error trying to log you in...");
    });

    socket.on('chat message', function(msg, callback)
    {
        console.log("Chat message request received");
        var userSentTo = msg.sentTo;
        var message = msg.text;
        socket.emit("tokenVerifyRequest", "", function(token)
        {
            console.log("Processing chat message token");
            var name = "Unknown";
            for (var i = 0; i < sockets.length; i++)
            {
                if (sockets[i] === socket)
                {
                    name = names[i];
                }
            }
            if ((typeof debugMode !== "undefined" && debugMode === 1) || token === syncConnRead.query(
                "SELECT token FROM User where " +
                "username = '" + name + "';")[0].token)
            {
                console.log('message: ' + message);
                console.log('Was set to: ' + userSentTo);



                for (var j = 0; j < sockets.length; j++)
                {
                    if (names[j] === userSentTo)
                    {
                        var sendSocket = sockets[j];
                        //Sends message to the specified user
                        sendSocket.emit("tokenVerifyRequest", "",
                        function(token)
                            {
                                var tok = syncConnRead.query(
                                    "SELECT token FROM " +
                                    "User where username = '" +
                                    userSentTo + "';");
                                tok = tok[0].token;
                                var messageObj = messageFactory(
                                    name, message);
                                if (token === tok)
                                {
                                    sendSocket.emit('chat message',
                                        messageObj);
                                }
                                else
                                {
                                    console.log(
                                        "Token error on receiver"
                                    );
                                    return callback(-1, "Token Error");

                                }
                            });
                    }
                }
                console.log('By: ' + name);
                var sql =
                    "INSERT INTO Message (SentFrom, SentTo, Message, " +
                    "timestamp) VALUES ('" + name + "', '" +
                    userSentTo + "', '" +
                    key.encrypt(message, 'base64') +
                    "', FROM_UNIXTIME('" +
                    Date.now() / 1000 + "'));";
                console.log(sql);
                write.query(sql, function(err, result)
                {
                    if (err) throw err;
                });
                return callback(1, "Message sent successfully");
            }
        });
    });

    socket.on('disconnect', function()
    {
        console.log(this.id + " is logging out");
        var sql = "UPDATE User SET isOnline='N' WHERE username='" +
            this.id + "';"
        write.query(sql, function(err)
        {
            if (err) throw err;
        });
    });

    socket.on('chathistory', function(name, from, callback)
    {
        //to make this better
        console.log("in chatHistory");
        console.log("loading chat history for: " + name + " and " +
            from);
        var sql =
            "SELECT * FROM Message WHERE (SentFrom, SentTo) = ('" +
            name +
            "', '" + from + "') OR (SentTo, SentFrom) = ('" + name +
            "', '" +
            from + "') ORDER BY timestamp ASC;";
        read.query(sql, function(err, result)
        {
            if (err)
                throw err;
            for (var x in result)
            {
                result[x].Message = key.decrypt(result[x].Message,
                    'utf8');
            }

            for (var z in result)
            {
                console.log("message: " + result[z].Message);
            }

            socket.emit("tokenVerifyRequest", "", function(token)
            {
                console.log("token was verified");
                if (token === syncConnRead.query(
                    "SELECT token FROM User " +
                    "where " + "username = '" + name +
                    "';")[0].token)
                {
                    return callback(result, "");
                }
            });
        });
    });


    socket.on('userNameSend', function(userName)
    {
        console.log("in userNameSend");
        sockets.push(socket);
        names.push(userName);
        socket.id = userName;
        console.log("New User Connected: " + socket.id);
        socket.emit("tokenVerifyRequest", "", function(token)
        {
            console.log("Token is: " + syncConnRead.query(
                "SELECT token FROM " +
                "User where username = '" + userName + "';"
            )[0].token);
            if (token === syncConnRead.query(
                "SELECT token FROM User where " +
                "username = '" + userName + "';")[0].token)
            {
                var sql = "SELECT * FROM Friends where Host = '" +
                    userName + "';";
                read.query(sql, function(err, result)
                {
                    console.log("Emitting friends list to " +
                        userName);
                    if (err) throw err;
                    console.log(
                        "----------------------------");
                    socket.emit('FriendsList', result);
                });
            }
            else {
                console.log("Token failure in userNameSend");
                return callback(0, userName);
            }
        });
    });

    /*SKYLERS NEW CODE*/
<<<<<<< HEAD
    socket.on('verifyEmailLogin', function(creds, callback)
    {
=======
    socket.on('verifyEmailLogin', function (creds, callback) {
>>>>>>> f9c49b6ef97dfbfbf4b5362b064e5d6657f74a0e
        var emailHash = creds.email;
        var passwordHash = bcrypt.hashSync(creds.password, saltRounds);
        var sql = "SELECT * FROM User where emailHash = '" +
            emailHash + "';";
        var result = syncConnWrite.query(sql);
        if (result.length !== 0)
        {
            var hash = result[0].passwordHash;
            hash = hash.toString();
            if (bcrypt.compareSync(creds.password, hash))
            {
                console.log("HASH MATCH!");
                console.log("result passwordHash: \"" + result[0].passwordHash +
                    "\"");
                console.log("passwordHash: \"" + passwordHash + "\"");
                console.log("emitting successful auth");
                var user = {
                    "name": result[0].username,
                    "token": result[0].token
                };
                //console.log("User Exists: ", user.name, user.token);
                this.id = user.name;
<<<<<<< HEAD
                return callback(1, user);
=======
                socket.emit('authSuccessNoGmail', user);
                return callback(1, creds);
>>>>>>> f9c49b6ef97dfbfbf4b5362b064e5d6657f74a0e
            }
            else
            {
                console.log("Sending bad message");
<<<<<<< HEAD
                return callback(-1, "Bad username or password");
=======
                socket.emit('authFailureAppDiscrepancy',"");
                return callback(-1, creds);
>>>>>>> f9c49b6ef97dfbfbf4b5362b064e5d6657f74a0e
            }
        }
        else {
            console.log("User Does Not Exist");
            var unhashedCreds = {
                "emailHash": emailHash,
                "password": creds.password
            };
<<<<<<< HEAD
            return callback(0, unhashedCreds);
=======
            socket.emit('newNoGmailUser', unhashedCreds);
            return callback(0, creds);
>>>>>>> f9c49b6ef97dfbfbf4b5362b064e5d6657f74a0e
        }
    });

    /*TODO: Account creation no gmail*/
    socket.on("identifyMyselfNoGmail", function(whoIAm, callback)
    {
        //add the new user to the database
        const tok = randomstring.generate(255);
        var passwordHash = bcrypt.hashSync(whoIAm.password,
            saltRounds);
        var insertSQL = "INSERT INTO User (userName,emailHash," +
            "token, passwordHash) VALUES('" + whoIAm.person.toLowerCase() +
            "','" + whoIAm.emailHash + "', '" + tok + "', '" +
            passwordHash + "');";
        syncConnWrite.query(insertSQL);
        var user = {
            "name": whoIAm.person.toLowerCase(),
            "token": tok
        };
        console.log("emitting authSuccessNewUserNOGMAIL");
        return callback(user);
    });
    /*SKYLERS NEW CODE*/

    //catch verifyToken event emitted on google login
    socket.on('verifyToken', function(token, callback)
    {
        console.log("token: " + token);
        var options = {
            method: 'GET',
            url: 'https://www.googleapis.com/oauth2/v3/tokeninfo',
            qs:
                {
                    id_token: token
                },
            headers:
                {
                    'Postman-Token': 'cdeb0bf8-56b1-4a8d-b7cc-08cfb1eaa41d',
                    'Cache-Control': 'no-cache'
                }
        };

        request(options, function(error, response, body)
        {
            //parse request body
            if (error) throw new Error(error);
            var body2 = JSON.parse(JSON.stringify(body));

            //parse body for API key
            var audLocation = body.indexOf('aud'); // => 18
            var aud = body.substring(audLocation, body.length);
            aud = aud.substring(aud.indexOf('"'), aud.length);
            aud = aud.substring(aud.indexOf('"') + 1, aud.length);
            aud = aud.substring(aud.indexOf('"') + 1, aud.length);
            aud = aud.substring(0, aud.indexOf('"'));

            //parse body for user email
            var emailLocation = body2.indexOf('email'); // => 18
            var email = body.substring(emailLocation, body.length);
            email = email.substring(email.indexOf('"'), email.length);
            email = email.substring(email.indexOf('"') + 1,
                email.length);
            email = email.substring(email.indexOf('"') + 1,
                email.length);
            email = email.substring(0, email.indexOf('"'));
            if (aud !==
                "521002119514-k8kp3p42fpoq7ia5868k9s9e62bj87n3.apps." +
                "googleusercontent.com")
                return callback(-1, token);
                //If you're attempting to login with a token for another app

            var hash = sha256(email);

            var sql =
                "SELECT username FROM User where emailHash = '" +
                hash +
                "';";
            //if user doesn't exist add them
            write.query(sql, function(err, result)
            {
                if (err) throw err;
                if (result.length === 0)
                {
                    //emit unknownPerson request for first time user account
                    // creation on the front end
                    //handle new user info emitted from the front end
                    socket.emit("unknownPerson", function(whoIAm)
                    {
                        //add the new user to the database
                        var tok = randomstring.generate(
                            255);
                        var insertSQL =
                            "INSERT INTO User (userName,emailHash,token) VALUES('" +
                            whoIAm.toLowerCase() + "','" +
                            hash + "', '" + tok + "');";
                        write.query(insertSQL, function(
                            err, result)
                        {
                            if (err) throw err;
                        });
                        console.log(tok);
                        var user = {
                            name: whoIAm.toLowerCase(),
                            token: tok
                        };
                        return callback(1, user);
                    });
                }
                //if user exists, authenticate them
                else
                {
                    var userName = result[0].username;
                    userName = userName.substr(0, userName.length);
                    var newTok = randomstring.generate(255);
                    syncConnWrite.query(
                        "UPDATE User set token = '" +
                        newTok + "' where username = '" +
                        userName + "';");
                    console.log("Sending token: " + newTok);
                    var user = {
                        name: userName,
                        token: newTok
                    };
                    return callback(2, user);
                }
            });
        });

    });

    socket.on('isOnline', function(user, callback)
    {
        var sql = "SELECT isOnline FROM User WHERE username='" + user +
            "';";
        read.query(sql, function(err, result)
        {
            if (err) throw err;
            if (result[0].isOnline === 'Y')
                return callback(true, user);
            else
                return callback(false, user);
        });
    });

    socket.on('addFriend', function(currentUser, friendToAdd, callback)
    {
        console.log("Adding " + friendToAdd + " for " + currentUser +
            " as a friend");
        //check to see if the friend relationship already exists
        var sql = "SELECT * FROM Friends WHERE Host = \"" +
            currentUser + "\" " +
            "AND Receiver = \"" + friendToAdd + "\";";
        read.query(sql, function(err, result)
        {
            if (err) throw err;
            if (result.length === 0) // if the friend relationship doesn't exist
            {
                console.log("New friend!");

                sql =
                    "SELECT * FROM User WHERE username = \"" +
                    friendToAdd +
                    "\";";
                read.query(sql, function(err, result)
                {
                    if (err) throw err;
                    //make sure that the friend
                    // you're adding actually exists
                    if (result.length > 0)
                    {
                        currentUser = currentUser.toLowerCase();
                        friendToAdd = friendToAdd.toLowerCase();

                        sql =
                            "INSERT INTO Friends (Host, Receiver) VALUES ('" +
                            currentUser.toLowerCase() + "', '" +
                            friendToAdd.toLowerCase() + "');";

                        write.query(sql, function(err, result)
                        {
                            if (err) throw err;
                        });
                        console.log(friendToAdd.toLowerCase() +
                            " was added");
                        socket.emit('addFriendResult', 1,
                            friendToAdd
                                .toLowerCase());
                        return callback(1, friendToAdd);
                    }
                    else
                    {
                        console.log("User does not exist!");
                        socket.emit('addFriendResult', -1,
                            friendToAdd
                                .toLowerCase());
                        return callback(-1, friendToAdd);
                    }
                });
            }
            else
            {
                console.log("Friend already exists");
                socket.emit('addFriendResult', 0, friendToAdd);
                return callback(0, friendToAdd);
            }
        });
    });

    socket.on('removeFriend', function(user, friend, callback)
    {
        console.log("Removing " + friend + " for " + user +
            " as a friend");

        //check to see if the friend relationship already exists
        var sql = "SELECT * FROM User WHERE username = \"" + friend +
            "\";";
        read.query(sql, function(err, result)
        {
            if (err) throw err;
            if (result.length === 1) // if the user exists
            {
                console.log("User exists!");

                sql = "SELECT * FROM Friends WHERE Host = \"" +
                    user +
                    "\" AND " + "Receiver = \"" + friend + "\";";

                read.query(sql, function(err, result)
                {
                    if (err) throw err;
                    //make sure that the friend you're
                    // removing has a friend relationship
                    if (result.length > 0)
                    {
                        sql =
                            "DELETE FROM Friends WHERE (Host, Receiver) = " +
                            "('" + user + "', '" + friend +
                            "');";

                        write.query(sql, function(err, result)
                        {
                            if (err) throw err;
                        });
                        console.log(friend + " was removed");
                        return callback(1, friend);
                    }
                    else
                    {
                        console.log(
                            "Friend relationship does not exist"
                        );
                        return callback(0, friend);
                    }
                });
            }
            else
            {
                console.log("User does not exist");
                return callback(-1, friend);
            }
        });
    });

    socket.on('deleteAccount', function(userName, callback)
    {
        socket.emit("tokenVerifyRequest", "", function(token)
        {
            if ((typeof debugMode !== "undefined" && debugMode === 1) || token === syncConnRead.query(
                "SELECT token FROM User where " +
                "username = '" + userName + "';")[0].token)
            {
                var sql = "SELECT * FROM User WHERE username = '" +
                    userName +
                    "';";
                var result = syncConnWrite.query(sql);
                if (result.length !== 0)
                {
                    console.log("user found - deleting " +
                        result[0].username);

                    sql =
                        "DELETE FROM Message WHERE SentFrom = \"" +
                        result[0].username + "\" OR SentTo = \"" +
                        result[0].username + "\";";

                    write.query(sql, function(err)
                    {
                        if (err) throw err;
                    });

                    sql =
                        "DELETE FROM Friends WHERE Host = \"" +
                        result[0].username + "\" OR Receiver = \"" +
                        result[0].username + "\";";

                    write.query(sql, function(err)
                    {
                        if (err) throw err;
                    });

                    sql =
                        "DELETE FROM User WHERE username = \"" +
                        result[0].username + "\";";

                    write.query(sql, function(err)
                    {
                        if (err) throw err;
                    });
                    console.log("Account was deleted successfully");
                    return callback(1, userName +
                        ": account successfully deleted");
                }
                else
                {
                    console.log("There was an error somewhere...");
                    return callback(-1, userName +
                        ": something bad happened; account for " + userName + " was not deleted");
                }
            }
            else
            {
                console.log("Token failure in deleteAccount")
                return callback(-2, "token failure for " + userName + ": account not deleted");
            }
        });

    });
});