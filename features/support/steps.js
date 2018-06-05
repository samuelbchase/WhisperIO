debugMode = 1;
const { Given, When, Then, After, Before } = require('cucumber');
var assert = require('chai').assert;
var server = require('../../index.js');
var ioClient = require('socket.io-client');
var options = {
    transports: ['websocket'],
    'force new connection': true
};

///////////////////////////////////////////////////////////////////////////////
//                               Test Setups                                 //
///////////////////////////////////////////////////////////////////////////////
var client1;
var client2;

var mysql2 = require('sync-mysql');
var fs = require("fs");

var contents = fs.readFileSync('.info.txt');
var index = contents.indexOf('|');
var old = 0;
var host = contents.slice(old, index);

old = index + 3;
index = contents.indexOf('|', old);
var database = contents.slice(old, index);

old = index + 3;
index = contents.indexOf('|', old);
var readUN = contents.slice(old, index);

old = index + 3;
index = contents.indexOf('|', old);
var readPW = contents.slice(old, index);

old = index + 3;
index = contents.indexOf('|', old);
var writeUN = contents.slice(old, index);

old = index + 3;
index = contents.indexOf('|', old);
var writePW = contents.slice(old);
host = host.toString();
writeUN = writeUN.toString();
writePW = writePW.toString();
database = database.toString();

var syncConnWrite = new mysql2({
    host: host,
    user: writeUN,
    password: writePW,
    database: database
});

Before(function() {
    syncConnWrite.query("DELETE FROM Friends where Host = 'testuser1' OR Receiver = 'testuser1';");
    syncConnWrite.query("DELETE FROM Friends where Host = 'testuser2' OR Receiver = 'testuser2';");
    syncConnWrite.query("DELETE FROM Message where SentFrom = 'testuser2' OR SentTo = 'testuser2';");
    syncConnWrite.query("DELETE FROM User where username = 'testuser1';");
    syncConnWrite.query("DELETE FROM User where username = 'testuser2';");

    syncConnWrite.query("INSERT INTO User(username,isOnline,emailHash,token) VALUES ('testuser1','Y','1','123');");
    syncConnWrite.query("INSERT INTO User(username,isOnline,emailHash) VALUES ('testuser2','N','2');");

    server.runServer();
    client1 = ioClient.connect('http://localhost:3001', options);
    client2 = ioClient.connect('http://localhost:3001', options);
    client1.on('tokenVerifyRequest', function(msg, callback)
    {
        return callback("123");
    });
});

After(function() {
    server.closeServer();

    syncConnWrite.query("DELETE FROM Friends where Host = 'testuser1' OR Receiver = 'testuser1';");
    syncConnWrite.query("DELETE FROM Friends where Host = 'testuser2' OR Receiver = 'testuser2';");
    syncConnWrite.query("DELETE FROM Message where SentFrom = 'testuser1' OR SentTo = 'testuser1';");
    syncConnWrite.query("DELETE FROM Message where SentFrom = 'testuser2' OR SentTo = 'testuser2';");
    syncConnWrite.query("DELETE FROM User where username = 'testuser1';");
    syncConnWrite.query("DELETE FROM User where username = 'testuser2';");
});

var userTo;
var userFrom;

///////////////////////////////////////////////////////////////////////////////
//                               Actual Tests                                //
///////////////////////////////////////////////////////////////////////////////

/*                             friends.feature                                */
Given("A User", function() {
    userTo = 'testuser1';
    userFrom = 'testuser2';
});

When("That user goes offline", function() {
    // no when here
});

Then("Contact lists should display that user as offline", function(done) {
    client1.emit('isOnline', userFrom, function(result) {
        assert(result === false, "Error! Result was not true! Was " + result);
        done();
    });
});

When("That user comes online", function() {
    // no when here
});

Then("Contact lists should display that user as online", function(done) {
    client1.emit('isOnline', userTo, function(result) {
        assert(result === true, "Error! Result was not true! Was " + result);
        done();
    });
});


/*                            addFriends.feature                             */
Given("A User testuser1", function() {
    userTo = "testuser1";
});

When("I want to add a friend", function() {
    userFrom = "testuser2";
});

Then("That friend is added to my friends list", function(done) {
    client1.emit('addFriend', userTo, userFrom, function(result, user) {
        assert(result === 1, "Friend not added: friend is " + user);
        done();
    })
});

When("I want to add a friend that I already have as a friend", function() {
    userFrom = "testuser2";
    syncConnWrite.query("INSERT INTO Friends(Host, Receiver) VALUES ('testuser1','testuser2');");

});

Then("That friend is not added to my friends list", function(done) {
    client1.emit('addFriend', userTo, userFrom, function(result, user) {
        assert(result === 0, "Already existent friends wasn't caught: user is " + user);
        done();
    });
});

When("I want to add a friend that does not exist", function() {
    userFrom = "noUser";
});

Then("That friend is not added to my friends list, and the program tells me the user doesn't exist", function(done) {
   client1.emit('addFriend', userTo, userFrom, function(result, user) {
       assert(result === -1, "Added a user as a friend that doesn't exist! User is " + user);
       done();
   });
});

/*  Removing Friends */
When("I want to remove a friend", function() {
    userFrom = "testuser2";
    syncConnWrite.query("INSERT INTO Friends(Host, Receiver) VALUES('testuser1', 'testuser2');");
});

Then("That friend is removed from my friends list", function (done) {
   client1.emit('removeFriend', userTo, userFrom, function(result, user) {
       assert(result === 1, "Failed to remove a friend! User is " + user);
       done();
   });
});

When("I want to remove a friend that I am not friends with", function() {
    userFrom = "testuser1";
});
Then("The friend is not 'removed' or 'added'.", function(done) {
   client1.emit('removeFriend', userTo, userFrom, function(result, user) {
       assert(result === 0, "Failed to not remove a friend! User is " + user);
       done();
   });
});

When("I want to remove a friend that does not exist", function() {
   userFrom = "noExist";
});
Then("That friend is not removed from my list, and the system throws an error.", function(done) {
   client1.emit('removeFriend', userTo, userFrom, function(result, user) {
       assert(result === -1, "Removed a friend that didn't exist! User is " + user);
       done();
   });
});


/* account deletion */
Given("A User oldUser", function() {
    userTo = "oldUser";
    syncConnWrite.query("INSERT INTO User(username, emailHash) VALUES ('oldUser', '123456789010');");
});
When("I want to delete my account", function() {
    //nothing here
});
Then("The account is entirely removed from the system.", function(done) {
   client1.emit('deleteAccount', userTo, function(result) {
       assert(result === 1, "Failure to delete account!");
       done();
   }) ;
});

Given("A User noExist that doesn't exist", function() {
    userTo = "noExist";
});

When("I want to delete my account that doesn't exist", function() {
    // nothing should happen
});

Then("The account isn't removed, and the system throws an error.", function(done) {
    client1.emit('deleteAccount', userTo, function(result) {
        assert(result === -1, "Deleted an account that doesn't exist!");
        done();
    });
});

Given("A logged-out user", function()
{

});

When("They want to log in", function()
{

});

Then("The system logs them in", function()
{

});

Given("A User that is logged in", function()
{

});

When("They want to log out", function()
{

});

Then("The system logs them out", function()
{

});

Given("A user without an account", function()
{

});

When("They want to use the program", function()
{

});

Then("Creates an account for them", function()
{

});
