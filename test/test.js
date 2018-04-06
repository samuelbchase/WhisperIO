// test/test.js

var http = require('http');
var ioClient     = require('socket.io-client');
var server = require('../index.js');
var sinon  = require("sinon");
var assert = require('chai').assert;
var stdout = require('test-console').stdout;
var options = {
    transports: ['websocket'],
    'force new connection': true
};

describe('Sockets', function () {
    beforeEach(function() {
        sinon.stub(console, "log").returns(void 0);
        sinon.stub(console, "error").returns(void 0);
    });
    afterEach(function() {
        console.log.restore();
        console.error.restore();
    });
    server.listen();
    it('should return 200', function (done) {
        http.get('http://localhost:80', function (res) {
            assert.equal(200, res.statusCode);
            done();
        });
    });
    it('should send and receive a message', function (done) {
        // Set up client1 connection
        var client1 = ioClient.connect('http://localhost:80', options);

        // Set up event listener.  This is the actual test we're running\
        client1.emit('userNameSend', "Griffin");
        done();
    });
});
