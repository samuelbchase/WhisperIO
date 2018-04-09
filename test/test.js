// test/test.js
var intercept = require("intercept-stdout"),
    captured_text = "";
var http = require('http');
var ioClient     = require('socket.io-client');
var server = require('../indexTesting.js');
var sinon  = require("sinon");
var assert = require('chai').assert;
var options = {
    transports: ['websocket'],
    'force new connection': true
};

describe('User connections', function () {
    beforeEach(function() {
        sinon.stub(console, "log").returns(void 0);
        sinon.stub(console, "error").returns(void 0);
    });
    afterEach(function() {
        console.log.restore();
        console.error.restore();
    });
    var client1 = ioClient.connect('http://localhost:80', options);
    it('Is the server running?', function (done) {
        http.get('http://localhost:80', function (res) {
            assert.equal(200, res.statusCode);
        });
        done();
    });
    it('Can a client connect?', function (done) {
        // Set up client1 connection
        captured_text = "";
        var unhook_intercept = intercept(function(txt) {
            captured_text += txt;
        });
        client1.emit('testMsg', "this is a test");
        unhook_intercept();
        // Set up event listener.  This is the actual test we're running\
        assert(captured_text = "this is a test",'client is not connected');
        assert(captured_text != "blorp",'client is not connected');
        done();
    });

    it('Can a client send a login username?', function (done) {
        // Set up client1 connection
        captured_text = "";
        var unhook_intercept = intercept(function(txt) {
            captured_text += txt;
        });
        client1.emit('userNameSend', "Griffin");
        unhook_intercept();
        // Set up event listener.  This is the actual test we're running\
        assert(captured_text = "New User Connected: Griffin",'User successfully connected');
        assert(captured_text != "New User Connected: Joey",'User successfully connected');
        captured_text = "";
        done();
    });

    it('Can you add a friend you are already friends with?', function (done) {
       client1.emit('addFriend', "Griffin", "Geraldo");
       client1.on('addFriendResult', function(result, name) {
          assert(result === -1, "Added friend either does not exist or is not already friends");
       });
       done();
    });

    it('Can you add nonexistant friends?', function(done) {
       client1.emit('addFriend', "Griffin", "DoesNotExist");
       client1.on('addFriendResult', function(result, userName) {
          assert(result === 0, "Added friend added a nonexistant user");
       });
       done();
    });

    it('Does the program show your online friends?', function (done) {
       var client1 = ioClient.connect('http://localhost:80', options);
       client1.emit('isOnline', "Griffin");
       client1.on('isOnlineResult', function(result) {
          assert(result === true, "Online friends are not online");
       });
       done();
    });

    it('Does the program show your offline friends?', function (done) {
        var client1 = ioClient.connect('http://localhost:80', options);
        client1.emit('isOnline', "Sam");
        client1.on('isOnlineResult', function(result) {
            assert(result === false, "Offline friends are not offline");
        });
        done();
    });

});
