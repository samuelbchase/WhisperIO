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
var test_token = 'ziVZyHk5xeNBNhO2PyEg6XUykWXZae96FCTionjRCrKzrZaPJUba9Ek5JbYQ5qSPKRDJ1mh9Wk98b7qUVNeaS2z7s9dPs8bSn6vUi4tuqBqeHQ4qO6tRChactKnii2W9QeOSYIU8V0At4eHFLTpXzNJEOE2LVeZIL25suGRzEUCixsN6Rafu3ZGVM5N97DpOViIQCERzqc60LZyUNDwR21LgwwulF3grXYeSxIBiLjNUDH9BzSWS8tFgaFWoMnA';
var fake_token = 'alteredTokenUzI1NiIsImtpZCI6ImFmZmM2MjkwN2E0NDYxODJhZGMxZmE0ZTgxZmRiYTYzMTBkY2U2M2YifQ.eyJhenAiOiI1MjEwMDIxMTk1MTQtazhrcDNwNDJmcG9xN2lhNTg2OGs5czllNjJiajg3bjMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI1MjEwMDIxMTk1MTQtazhrcDNwNDJmcG9xN2lhNTg2OGs5czllNjJiajg3bjMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDQ1ODgyMTEyNjI4ODU0NTQxODgiLCJlbWFpbCI6InR3ZWx2ZWluY2h3aGVlbHNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJ4N08wdnJEWF9teTM5NURXeDMtaHpBIiwiZXhwIjoxNTI0NzA0MDY1LCJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwianRpIjoiYWFkZGJmMDBjZWU4NGNmNTJiNTY4NDliMGYwNDgzNGJiOGZkZTBiNiIsImlhdCI6MTUyNDcwMDQ2NSwibmFtZSI6IkdlcmFsZG8gTWFjaWFzIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS8tQXg0Yk1PWFFtNWMvQUFBQUFBQUFBQUkvQUFBQUFBQUFBR00va3d1MlJJTnNxRkUvczk2LWMvcGhvdG8uanBnIiwiZ2l2ZW5fbmFtZSI6IkdlcmFsZG8iLCJmYW1pbHlfbmFtZSI6Ik1hY2lhcyIsImxvY2FsZSI6ImVuIn0.bRqgreXFRQ6ABCKyVl8lM-rtlwpH6u48JY1ALYpT0pdQwgMKFpTycLy0ue7BFjvFqZG2mFJKyA9ao0jV5aj2USFBjBjx7Fl4fXRnqprM1ncI3roMfnRQjv72s3UBPWcJVHp-JS6SLAR-PqbimZtdUulf9U2CSALI12a6yp_b52qXnsA9VtlnQgs_ZPF9mkszG3eigg13cGT4Y3yFig-e31VdDbu1zdsF3S059wGS_QJtDevxZCa30yD11TG_TXgPjZ-mJtFl2enraUEvCn0q8QmJCMHN3TDui1ze9KtsKg1rmpRkXQZJLatwSB9xf6D0CAjvN4KBaBOSDuPPcUGlCg';

describe('User connections', function () {
    beforeEach(function() {
        sinon.stub(console, "log").returns(void 0);
        sinon.stub(console, "error").returns(void 0);
    });
    afterEach(function(done) {
        console.log.restore();
        console.error.restore();
        done();
    });
    after(function(done) {
        client1.disconnect();
        server.closeServer();
        done();
    });
    before(function(done) {
        server.runServer();
        client1 = ioClient.connect('http://localhost:3001', options);
        done();
    });

    it('Is the server running?', function (done) {
        this.timeout(5000);
        http.get('http://localhost:3000', function (res) {
            assert.equal(200, res.statusCode);
            done();
        });
    });

    /*
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
        client1.emit('userNameSend', "griffin");
        // Set up event listener.  This is the actual test we're running\
        assert("placeholder" ==="New User Connected: griffin",'User successfully connected');
        assert("placeholder" !== "New User Connected: joey",'User successfully connected');
        done();
    });

    it('Can a client be marked as online?', function (done) {
        // Set up client1 connection
        client1.emit('userLogin', "slarty bartfast");
        // Set up event listener.  This is the actual test we're running\
        assert("placeholder" === "Slarty Bartfast is logging in",'User did not get marked as online');
        assert("placeholder" !== "New User Connected: asdqweqweasd",'User successfully connected');
        done();
    )};

    it('Can you add a friend?', function(done) {
        client1.emit('addFriend', "griffin", "sam");
        client1.on('addFriendResult', function(result, userName) {
            assert(result === 1,"Failure to add a friend");
            done();
        });
    });

    it('Can you add a friend you are already friends with?', function (done) {
       client1.emit('addFriend', "griffin", "geraldo");
       client1.on('addFriendResult', function(result, name) {
          assert(result === -1, "Added friend either does not exist or is not already friends - result is " + result);
          done();
       });
    });

    it('Can you add nonexistant friends?', function(done) {
       client1.emit('addFriend', "griffin", "DoesNotExist");
       client1.on('addFriendResult', function(result, userName) {
          assert(result === 0,"Added friend added a nonexistant user");
          done();
       });
    });


    it('Does the program show your online friends?', function (done) {
       client1.emit('isOnline', "geraldo");
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
    */

    /* ***********************************************************
            Additional code coverage tests
    *********************************************************** */
    /*
    it('Can a real token be verified?', function (done) {
        client1.emit('verifyToken', test_token);
        client1.on('authSuccess', function(result) {
            // Is the above line correct?
            // What arguments to use below.
            assert(result === true, "geraldo");
            done();
        });

    });
    it('Can a fake token be verified?', function (done) {
        client1.emit('verifyToken', fake_token);
        client1.on('authFailureAppDiscrepancy', function(result) {
            assert(result === true, "Offline friends are not offline");
            done();
        });

    });
    it('Can a fake null token be verified?', function (done) {
        client1.emit('verifyToken', null);
        client1.on('error', function(result) {
            // Is the above line correct?
            // What arguments to use below.
            assert(result === false, "Offline friends are not offline");
            done();
        });

    });
    */
});

