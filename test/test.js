// test/test.js

var io     = require('socket.io-client');
var app = require('../index.js');
var sinon  = require("sinon");
var assert = require('chai').assert;
var stdout = require('test-console').stdout;

var socketUrl = 'http://localhost:3000/main';

var options = {
    transports: ['websocket'],
    'force new connection': true
};

var room = 'lobby';

describe('Sockets', function () {
    var client1, client2, client3;
    beforeEach(function() {
        sinon.stub(console, "log").returns(void 0);
        sinon.stub(console, "error").returns(void 0);
    });
    afterEach(function() {
        console.log.restore();
        console.error.restore();
    });

    it('should send and receive a message', function (done) {
        // Set up client1 connection
        client1 = io.connect(socketUrl, options);
        client2 = io.connect(socketUrl, options);
        // Set up event listener.  This is the actual test we're running
        var inspect = stdout.inspect();
        app.log();
        client1.emit('userNameSend', "Griffin");
        client2.emit('userNameSend', "Sam");
        client2.emit('userLogin', "Griffin");
        client2.emit('userLogin', "Sam");
        inspect.restore();
        assert.ok(inspect.output.length > 0);
        done();
    });
});