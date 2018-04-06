// test/test.js

var http = require('http');
var ioClient     = require('socket.io-client');
var server = require('../indexTesting.js');
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
    server.runServer();
    it('Is the server running?', function (done) {
        http.get('http://localhost:80', function (res) {
            assert.equal(200, res.statusCode);
            done();
        });
    });
    it('Can a client connect?', function (done) {
        // Set up client1 connection
        var client1 = ioClient.connect('http://localhost:80', options);
        // Set up event listener.  This is the actual test we're running\
        assert(client1.connected !== false,'client1 is not connected')
        client1.emit('userNameSend', "Griffin");
        done();
    });
});
