// test/test.js

var http = require('http');
var ioClient     = require('socket.io-client');
var server = require('../indexTesting.js');
var sinon  = require("sinon");
var assert = require('chai').assert;
var options = {
    transports: ['websocket'],
    'force new connection': true
};
var client1;

describe('User connections', function () {
    beforeEach(function(done) {
        sinon.stub(console, "log").returns(void 0);
        sinon.stub(console, "error").returns(void 0);
        client1 = ioClient.connect('http://localhost:80', options);
        client1.on('connect', function() {
            done();
        });
    });
    afterEach(function(done) {
        client1.disconnect();
        console.log.restore();
        console.error.restore();
        done();
    });
    after(function() {
        server.closeServer();
        process.exit(1);
    });
    before(function() {
        server.runServer();
    });

    it('Is the server running?', function (done) {
        http.get('http://localhost:80', function (res) {
            assert.equal(200, res.statusCode);
        });
        done();
    });
    it('Can a client connect?', function (done) {
        // Set up client1 connection
        client1.emit('testMsg', "this is a test");
        assert.ok("placeholder" === "this is a test",'client is not connected');
        // Set up event listener.  This is the actual test we're running\
        assert("placeholder" !== "blorp",'client is not connected');
        done();
    });

    it('Can a client send a login username?', function (done) {
        // Set up client1 connection
        client1.emit('userNameSend', "Griffin");
        // Set up event listener.  This is the actual test we're running\
        assert("placeholder" ==="New User Connected: Griffin",'User successfully connected');
        assert("placeholder" !== "New User Connected: Joey",'User successfully connected');
        done();
    });

    it('Can a client be marked as online?', function (done) {
        // Set up client1 connection
        client1.emit('userLogin', "Slarty Bartfast");
        // Set up event listener.  This is the actual test we're running\
        assert("placeholder" === "Slarty Bartfast is logging in",'User did not get marked as online');
        assert("placeholder" !== "New User Connected: asdqweqweasd",'User successfully connected');
        done();
    });


    it('Can you add a friend you are already friends with?', function (done) {
       client1.emit('addFriend', "Griffin", "Geraldo");
       client1.on('addFriendResult', function(result, name) {
          assert(result === -1, "Added friend either does not exist or is not already friends - result is " + result);
          done();
       });
    });

    it('Can you add nonexistant friends?', function(done) {
       client1.emit('addFriend', "Griffin", "DoesNotExist");
       client1.on('addFriendResult', function(result, userName) {
          assert(result === 0,"Added friend added a nonexistant user");
          done();
       });
    });

    it('Does the program show your online friends?', function (done) {
       client1.emit('isOnline', "Geraldo");
       client1.on('isOnlineResult', function(result) {
           assert(result === true, "Online friends are not online");
           done();
       });
    });

    it('Does the program show your offline friends?', function (done) {
        client1.emit('isOnline', "Sam");
        client1.on('isOnlineResult', function(result) {
            assert(result === false, "Offline friends are not offline");
            done();
        });
    });
    it('Dummy')
    {
        assert(true,"Dummy");
    }
});
