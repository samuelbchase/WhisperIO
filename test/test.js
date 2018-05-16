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

const test_token = 'MlzN3LdKQPInBZeKQ9IefPfB9uB6H0lsuBZEOM9RakB1PBqes6tA4i8PHk7BptDmOMXBAInPhaVtqbkXvRxorR0Z3X65p2lhTNV2SlcFmE2UTzHA9MmxvZ4giutzAwW11r0ONJ0VHrsdrCk3owBFace6VBbwy8CyD7HF4drhzhVNLVjfkzsciKlZUG4pN4QSHzGjTWYeZt0jsYRXpGAlHqEugQ6IzWd7trHLgSqXdSYJ8eysE8hlJP5vI8GqUOg';
const fake_token = 'alteredTokenUzI1NiIsImtpZCI6ImFmZmM2MjkwN2E0NDYxODJhZGMxZmE0ZTgxZmRiYTYzMTBkY2U2M2YifQ.eyJhenAiOiI1MjEwMDIxMTk1MTQtazhrcDNwNDJmcG9xN2lhNTg2OGs5czllNjJiajg3bjMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI1MjEwMDIxMTk1MTQtazhrcDNwNDJmcG9xN2lhNTg2OGs5czllNjJiajg3bjMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDQ1ODgyMTEyNjI4ODU0NTQxODgiLCJlbWFpbCI6InR3ZWx2ZWluY2h3aGVlbHNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJ4N08wdnJEWF9teTM5NURXeDMtaHpBIiwiZXhwIjoxNTI0NzA0MDY1LCJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwianRpIjoiYWFkZGJmMDBjZWU4NGNmNTJiNTY4NDliMGYwNDgzNGJiOGZkZTBiNiIsImlhdCI6MTUyNDcwMDQ2NSwibmFtZSI6IkdlcmFsZG8gTWFjaWFzIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS8tQXg0Yk1PWFFtNWMvQUFBQUFBQUFBQUkvQUFBQUFBQUFBR00va3d1MlJJTnNxRkUvczk2LWMvcGhvdG8uanBnIiwiZ2l2ZW5fbmFtZSI6IkdlcmFsZG8iLCJmYW1pbHlfbmFtZSI6Ik1hY2lhcyIsImxvY2FsZSI6ImVuIn0.bRqgreXFRQ6ABCKyVl8lM-rtlwpH6u48JY1ALYpT0pdQwgMKFpTycLy0ue7BFjvFqZG2mFJKyA9ao0jV5aj2USFBjBjx7Fl4fXRnqprM1ncI3roMfnRQjv72s3UBPWcJVHp-JS6SLAR-PqbimZtdUulf9U2CSALI12a6yp_b52qXnsA9VtlnQgs_ZPF9mkszG3eigg13cGT4Y3yFig-e31VdDbu1zdsF3S059wGS_QJtDevxZCa30yD11TG_TXgPjZ-mJtFl2enraUEvCn0q8QmJCMHN3TDui1ze9KtsKg1rmpRkXQZJLatwSB9xf6D0CAjvN4KBaBOSDuPPcUGlCg';

describe('User connections', function () {
    beforeEach(function() {
        server.runServer();
        client1 = ioClient.connect('http://localhost:3001', options);
        //sinon.stub(console, "log").returns(void 0);
        //sinon.stub(console, "error").returns(void 0);
    });
    afterEach(function(done) {
        client1.disconnect();
        server.closeServer();
        //console.log.restore();
        //console.error.restore();
        done();
    });
    after(function() {
        //process.exit(0);
    });
    before(function() {

    });

    it('Is the server running?', function (done) {
        this.timeout(5000);
        return http.get('http://localhost:3001', function (res) {
            assert.equal(200, res.statusCode);
            done();
        });
    });

    it('Can you add a friend?', function(done) {
        this.timeout(5000);
        var string = "NOTE : THIS TEST WILL GENERALLY FAIL UNLESS THE DB IS UPDATED PRIOR TO RUNNING THE TEST\nAssertionError"
        client1.emit('addFriend', "griffin", "testuser1", function(result) {
            assert.equal(result, 1, "Failure to add a friend\n" + string);
            done();
        });
    });

    it('Can you add a friend you are already friends with?', function (done) {
        this.timeout(5000);
        client1.emit('addFriend', "griffin", "sam", function(result) {
            assert.equal(result, 0, "Added friend either does not exist or is not already friends");
            done();
        });
    });

    it('Can you add nonexistant users as friends?', function(done) {
        this.timeout(5000);
        client1.emit('addFriend', "griffin", "DoesNotExist", function(result) {
            assert.equal(result, -1, "Added friend added a nonexistant user");
            done();
        });
    });


    it('Does the program show your online friends?', function (done) {
       client1.emit('isOnline', "testuser1", function(result, name) {
            assert.equal(result, true, "Online friends");
            done();
        });
    });


    it('Does the program show your offline friends?', function (done) {
        client1.emit('isOnline', "testuser2");
        client1.on('isOnlineResult', function(result) {
            assert.equal(result, false, "Offline friends are not offline - result is " + result);
            done();
        });
    });
    /*

    /* ***********************************************************
            Additional code coverage tests
    *********************************************************** */


    it('Can a real token be verified?', function (done) {
        client1.emit('verifyToken', test_token);
        client1.on('authSuccess', function(result) {
            // Is the above line correct?
            // What arguments to use below.
            assert(result === true, "geraldo");
            done();
        });

    });
    /*
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

