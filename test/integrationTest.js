// test/test.js
debugMode = 1;
var http = require('http');
var ioClient = require('socket.io-client');
var server = require('../index.js');
var sinon = require("sinon");
var assert = require('chai').assert;
var options = {
    transports: ['websocket'],
    'force new connection': true
};
var client1;

const test_token = 'ziVZyHk5xeNBNhO2PyEg6XUykWXZae96FCTionjRCrKzrZaPJUba9Ek5JbYQ5qSPKRDJ1mh9Wk98b7qUVNeaS2z7s9dPs8bSn6vUi4tuqBqeHQ4qO6tRChactKnii2W9QeOSYIU8V0At4eHFLTpXzNJEOE2LVeZIL25suGRzEUCixsN6Rafu3ZGVM5N97DpOViIQCERzqc60LZyUNDwR21LgwwulF3grXYeSxIBiLjNUDH9BzSWS8tFgaFWoMnA';
const fake_token = 'alteredTokenUzI1NiIsImtpZCI6ImFmZmM2MjkwN2E0NDYxODJhZGMxZmE0ZTgxZmRiYTYzMTBkY2U2M2YifQ.eyJhenAiOiI1MjEwMDIxMTk1MTQtazhrcDNwNDJmcG9xN2lhNTg2OGs5czllNjJiajg3bjMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI1MjEwMDIxMTk1MTQtazhrcDNwNDJmcG9xN2lhNTg2OGs5czllNjJiajg3bjMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDQ1ODgyMTEyNjI4ODU0NTQxODgiLCJlbWFpbCI6InR3ZWx2ZWluY2h3aGVlbHNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJ4N08wdnJEWF9teTM5NURXeDMtaHpBIiwiZXhwIjoxNTI0NzA0MDY1LCJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwianRpIjoiYWFkZGJmMDBjZWU4NGNmNTJiNTY4NDliMGYwNDgzNGJiOGZkZTBiNiIsImlhdCI6MTUyNDcwMDQ2NSwibmFtZSI6IkdlcmFsZG8gTWFjaWFzIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS8tQXg0Yk1PWFFtNWMvQUFBQUFBQUFBQUkvQUFBQUFBQUFBR00va3d1MlJJTnNxRkUvczk2LWMvcGhvdG8uanBnIiwiZ2l2ZW5fbmFtZSI6IkdlcmFsZG8iLCJmYW1pbHlfbmFtZSI6Ik1hY2lhcyIsImxvY2FsZSI6ImVuIn0.bRqgreXFRQ6ABCKyVl8lM-rtlwpH6u48JY1ALYpT0pdQwgMKFpTycLy0ue7BFjvFqZG2mFJKyA9ao0jV5aj2USFBjBjx7Fl4fXRnqprM1ncI3roMfnRQjv72s3UBPWcJVHp-JS6SLAR-PqbimZtdUulf9U2CSALI12a6yp_b52qXnsA9VtlnQgs_ZPF9mkszG3eigg13cGT4Y3yFig-e31VdDbu1zdsF3S059wGS_QJtDevxZCa30yD11TG_TXgPjZ-mJtFl2enraUEvCn0q8QmJCMHN3TDui1ze9KtsKg1rmpRkXQZJLatwSB9xf6D0CAjvN4KBaBOSDuPPcUGlCg';
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

var syncConnWrite = new mysql2(
    {
        host: host,
        user: writeUN,
        password: writePW,
        database: database
    });

function resetState() {
    syncConnWrite.query("DELETE FROM Friends where Host= 'testuser1' OR Receiver = 'testuser1';");
    syncConnWrite.query("DELETE FROM Friends where Host= 'testuser2' OR Receiver = 'testuser2';");
    syncConnWrite.query("DELETE FROM Message where SentFrom= 'testuser1' OR SentTo = 'testuser1';");
    syncConnWrite.query("DELETE FROM Message where SentFrom= 'testuser2' OR SentTo = 'testuser2';");
    syncConnWrite.query("DELETE FROM User where username= 'testuser1';");
    syncConnWrite.query("DELETE FROM User where username= 'testuser2';");
    syncConnWrite.query("INSERT INTO User(username,isOnline,emailHash,token) VALUES ('testuser1','Y','1','123');");
    syncConnWrite.query("INSERT INTO User(username,isOnline,emailHash) VALUES ('testuser2','N','2');");
    syncConnWrite.query("INSERT INTO Friends(Host,Receiver) VALUES ('testuser1','testuser2');");
}

/****************************************/
//tests integration of addFriend and isOnline
describe('Integration Test1', function()
{
    this.timeout(6000);

    beforeEach(function ()
    {
        server.runServer();
        console.log("Host: " + syncConnWrite.host);
        client1 = ioClient.connect('http://localhost:3001', options);
        client1.on('tokenVerifyRequest', function(msg)
        {
            client1.emit("tokenVerifyAnswer", "123");
        });
    });

    afterEach(function() {
        client1.disconnect();
        server.closeServer();
    });

    //integration tests alter the state of the program to see how different
    // pieces of the program interact with eachother accross multiple tests.
    //In integration tests the state will only be reset between integration tests
    // rather than after eac test.
    resetState();

    //sanity check test
    it('Is the server running?', function(done) {
        return http.get('http://localhost:3001', function(res)
        {
            assert.equal(200, res.statusCode);
            done();
        });
    });

    /*START INTEGRATION TESTS*/
    it('Add a friend', function(done) {
        //can you add a friend?
        syncConnWrite.query("DELETE FROM Friends where Host= 'testuser2' OR Receiver = 'testuser2';");
        client1.emit('addFriend', "testuser1", "testuser2", function(result) {
            assert.equal(result, 1, "Friend added successfully");
            done();
        });
    });

    it('Add duplicate friend', function(done) {
        client1.emit('addFriend', "testuser1", "testuser2", function(result) {
            assert.equal(result, 0, "Added friend either does not exist or is not already friends");
            done();
        });
    });

    it('Add friend that doesn\'t exit', function(done) {
        client1.emit('addFriend', "testuser2", "abcdefg", function(result) {
            assert.equal(result, -1, "Added friend added a nonexistant user");
            done();
        });
    });

    //ensure isOnline emit integrates with addFriend emit
    it('Does the program show your online friends?', function(done) {
        client1.emit('isOnline', "testuser1", function(result) {
            assert.equal(result, 1, "Offline friends are not offline - result is " + result);
            done();
        });
    });

    it('Does the program show non-online friends?', function(done) {
        client1.emit('isOnline', "testuser2", function(result) {
            assert.equal(result, false, "Offline friends are not offline - result is " + result);
            done();
        });
    });
});

/****************************************/
//tests integration of addFriend and removeFriend
describe('Integration Test 2', function()
{
    this.timeout(6000);

    beforeEach(function ()
    {
        server.runServer();
        console.log("Host: " + syncConnWrite.host);
        client1 = ioClient.connect('http://localhost:3001', options);
        client1.on('tokenVerifyRequest', function(msg)
        {
            client1.emit("tokenVerifyAnswer", "123");
        });
    });

    afterEach(function() {
        client1.disconnect();
        server.closeServer();
    });

    resetState();

    /*START INTEGRATION TESTS*/
    it('Add a friend', function(done) {
        //can you add a friend?
        syncConnWrite.query("DELETE FROM Friends where Host= 'testuser2' OR Receiver = 'testuser2';");
        client1.emit('addFriend', "testuser1", "testuser2", function(result) {
            assert.equal(result, 1, "Friend added successfully");
            done();
        });
    });

    //ensure remove friend integrates
    it('Can an existing friend be removed?', function(done) {
        client1.emit('removeFriend', 'testuser1', 'testuser2', function(result, friend) {
            assert.equal(result, 1);
            done();
        });
    });

    //can a non-existant friend be removed?
    it('Can an existing friend be removed?', function(done) {
        client1.emit('removeFriend', 'testuser1', 'testuser2', function(result, friend) {
            assert.equal(result, 0);
            done();
        });
    });
});

/****************************************/
//tests integration of addFriend, userLogin, and chatHistory
describe('Integration Test 3', function()
{
    this.timeout(6000);

    beforeEach(function ()
    {
        server.runServer();
        console.log("Host: " + syncConnWrite.host);
        client1 = ioClient.connect('http://localhost:3001', options);
        client1.on('tokenVerifyRequest', function(msg)
        {
            client1.emit("tokenVerifyAnswer", "123");
        });
    });

    afterEach(function() {
        client1.disconnect();
        server.closeServer();
    });

    resetState();

    /*START INTEGRATION TESTS*/
    it('Can a user log in?', function(done) {
        client1.emit('userLogin', 'testuser1', function(result) {
            assert.equal(result, 0);
            done();
        });
    });

    it('Add a friend who doesn\'t exist', function(done) {
        //can you add a friend who doesn't have an account?
        client1.emit('addFriend', "testuser1", "wot", function(result) {
            assert.equal(result, -1, "Friend added successfully");
            done();
        });
    });

    it('Can I view chat history of a user that exists?', function(done) {
        client1.emit('chathistory', 'testuser1', 'testuser2', function(result) {
            assert.equal(result, 0);
            done();
        });
    });

    it('Add a friend who doesn\'t exist but used to', function(done) {
        syncConnWrite.query("DELETE FROM User where username= 'testuser2';");
        //can you add a friend who just deleted their account?
        client1.emit('addFriend', "testuser1", "testuser2", function(result) {
            assert.equal(result, -1, "Friend added successfully");
            done();
        });
    });

    it('Can I view chat history of a user that DOESN\'T EXIST?', function(done) {
        client1.emit('chathistory', 'testuser1', 'testuser2', function(result) {
            assert.equal(result, -1);
            done();
        });
    });
});

/****************************************/
//tests integration of addFriend, removeFriend and isOnline
describe('Integration Test 4', function()
{
    this.timeout(6000);

    beforeEach(function ()
    {
        server.runServer();
        console.log("Host: " + syncConnWrite.host);
        client1 = ioClient.connect('http://localhost:3001', options);
        client1.on('tokenVerifyRequest', function(msg)
        {
            client1.emit("tokenVerifyAnswer", "123");
        });
    });

    afterEach(function() {
        client1.disconnect();
        server.closeServer();
    });

    resetState();

    //see if  friend shows up as online.
    it('Does the program show your online friends?', function(done) {
        //should be false because testuser2 is not actually online
        client1.emit('isOnline', "testuser1", function(result) {
            assert.equal(result, true, "Offline friends are not offline - result is " + result);
            done();
        });
    });


    it('Add testuser1 as friend for testuser2', function(done) {
        //can you add a friend?
        client1.emit('addFriend', "testuser2", "testuser1", function(result) {
            assert.equal(result, 1, "Friend added successfully");
            done();
        });
    });


    //see if deleted friend shows up as online.
    it('Does the program show your online friends?', function(done) {
        client1.emit('isOnline', "testuser2", function(result) {
            assert.equal(result, false, "Offline friends are not offline - result is " + result);
            done();
        });
    });


    it('Remove testuser1 from testuser2 friends list', function(done) {
        client1.emit('removeFriend', 'testuser2', 'testuser1', function(result, friend) {
            assert.equal(result, 1);
            done();
        });
    });

    //add friend back
    it('Add testuser2 back', function(done) {
        client1.emit('addFriend', "testuser2", "testuser1", function(result) {
            assert.equal(result, 1, "Friend added successfully");
            done();
        });
    });

    //see if re-added friend shows up as online.
    it('Does the program show your online friends?', function(done) {
        client1.emit('isOnline', "testuser1", function(result) {
            assert.equal(result, true, "Offline friends are not offline - result is " + result);
            done();
        });
    });
});

/****************************************/
//tests integration of verifyEmailLogin and addFriend
describe('Integration Test 5', function()
{
    this.timeout(6000);

    beforeEach(function ()
    {
        server.runServer();
        console.log("Host: " + syncConnWrite.host);
        client1 = ioClient.connect('http://localhost:3001', options);
        client1.on('tokenVerifyRequest', function(msg)
        {
            client1.emit("tokenVerifyAnswer", "123");
        });
    });

    afterEach(function() {
        client1.disconnect();
        server.closeServer();
    });

    resetState();

    it('Add a friend', function(done) {
        //can you add a friend?
        client1.emit('addFriend', "testuser1", "testuserbacon", function(result) {
            assert.equal(result, 1, "Friend added successfully");
            done();
        });
    });

    it('Can I verify a valid account with a valid password?', function(done) {
        var creds = {'email' : 'testuserbacon', 'password' : 'bacon'};
        client1.emit('verifyEmailLogin', creds, function(result) {
            assert.equal(1, result);
            done();
        });
    });

    it('Can I verify a valid account with an invalid password?', function(done) {
        var creds = {'email' : 'testuserbacon', 'password' : 'cheese'};
        client1.emit('verifyEmailLogin', creds, function(result) {
            assert.equal(-1, result);
            done();
        });
    });

    it('Can I verify an invalid account?', function(done) {
        var creds = {'email' : 'testusercheese', 'password' : 'itdoesntmatter'};
        client1.emit('verifyEmailLogin', creds, function(result) {
            assert.equal(0, result);
            done();
        });
    });

    it('Can I verify a testUser account?', function(done) {
        var creds = {'email' : 'testuser1', 'password' : 'wrongpassword'};
        client1.emit('verifyEmailLogin', creds, function(result) {
            assert.equal(0, result);
            done();
        });
    });
});

/****************************************/
//tests integration of
describe('Integration Test 6', function()
{
    this.timeout(6000);

    beforeEach(function ()
    {
        server.runServer();
        console.log("Host: " + syncConnWrite.host);
        client1 = ioClient.connect('http://localhost:3001', options);
        client1.on('tokenVerifyRequest', function(msg)
        {
            client1.emit("tokenVerifyAnswer", "123");
        });
    });

    afterEach(function() {
        client1.disconnect();
        server.closeServer();
    });

    resetState();

    it('Can I send a message?', function(done) {
        var message = new Object();
        message.sentTo = "testuser1";
        message.text = "Test";
        client1.emit('chat message', message, function(result) {
            assert.equal(result, 0);
            done();
        });
    });

});