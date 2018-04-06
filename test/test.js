// test/test.js

var expect = require('chai').expect;
var io     = require('socket.io-client');
var app = require('../index.js');

var socketUrl = 'http://localhost:3000/main';

var options = {
    transports: ['websocket'],
    'force new connection': true
};

var room = 'lobby';

describe('Sockets', function () {
    var client1, client2, client3;

    // ... test.js

    it('should send and receive a message', function (done) {
        // Set up client1 connection
        client1 = io.connect(socketUrl, options);
        client2 = io.connect(socketUrl, options);

        // Set up event listener.  This is the actual test we're running
        client1.emit('userNameSend', "Griffin");
        client2.emit('userNameSend', "Sam");
        client2.emit('userLogin', "Griffin");
        client2.emit('userLogin', "Sam");
        done();
    });
});