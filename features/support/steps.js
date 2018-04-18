// features/support/steps.js
const { Given, When, Then, AfterAll } = require('cucumber');
const { expect } = require('chai');
const server = require('../../indexTesting.js')
var ioClient = require('socket.io-client');
var options = {
    transports: ['websocket'],
    'force new connection': true
};
var client1;

Given('a chat message', function() {
    this.setMessage("This is a test");
});

When('I send the message', function() {
    client1.emit('testMsg', this.variable);
});

Then('a friend should receive the message', function() {
    client1.on('testMsgResponse', function(message) {
        this.variable = message;
        return expect(this.variable).to.equal('It worked');
    });
});

Given('a dummy test', function() {
    expect(true).to.be.equal(true);
    return;
});

AfterAll(function() {
    client1.disconnect();
    server.closeServer();
    return;
});

exports.startServer = function () {
    server.runServer();
    client1 = ioClient.connect('http://localhost:3000', options);
    return;
}