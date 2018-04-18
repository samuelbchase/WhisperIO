// features/support/steps.js
const { Given, When, Then, AfterAll, BeforeAll } = require('cucumber');
const { expect } = require('chai');
const server = require('../../indexTesting.js')
var ioClient = require('socket.io-client');
var options = {
    transports: ['websocket'],
    'force new connection': true
};
var client1;
var message;

Given('a chat message', function() {
    message = "This is a test";
});

When('I send the message', function() {
    client1.emit('testMsg', message);
});

Then('a friend should receive the message', function(done) {
    client1.on('testMsgResponse', function(message) {
        expect(message).to.equal("pass");
        done();
    });
});

Given('a dummy test', function() {
    console.log("given");
});

When('I do nothing', function() {
    console.log("when");
});

Then('nothing should happen', function() {
    expect(true).to.equal(true);
});

BeforeAll(function() {
    server.runServer();
    client1 = ioClient.connect('http://localhost:3000', options);
});

AfterAll(function() {
    client1.disconnect();
    server.closeServer();
});