// features/support/steps.js
const { Given, When, Then, After, Before, AfterAll } = require('cucumber');
const { expect } = require('chai');
const server = require('../../indexTesting.js')
var ioClient = require('socket.io-client');
var options = {
    transports: ['websocket'],
    'force new connection': true
};
var client1;
var testVar;

Given('a chat message', function() {
    testVar = "This is a test";
});

When('I send the message', function() {
    client1.emit('testMsg', testVar);
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

Given('I am logged In and I want to add a friend', function() {
    testVar = "Griffin";
});

When('I click the "Add Friend" button and I type in my friend\'s user name', function() {
    // THIS TEST WILL FAIL UNLESS YOU MODIFY THE DATABASE
   client1.emit('addFriend', "Geraldo", testVar);
});

Then('that user should be added to my friends list', function(done) {
    // (THIS SHOULD FAIL UNLESS SPECIFIC CONDITIONS ARE IN PLACE BEFOREHAND)
    client1.on('addFriendResult', function(result, userName) {
        expect(result).to.equal(1);
        done();
    })
});

Given('I am loggin in and want to remove a friend', function() {
    console.log("this isn't implemented yet");
});

When('I click the "Remove Friend" button and type in my friend\'s user name', function() {
   console.log("this also isn't done");
});

Then('that user should be removed from my friends list', function(done) {
    console.log("this will be implemented soon, as the above");
    done();
})

Before(function() {
    server.runServer();
    client1 = ioClient.connect('http://localhost:3000', options);
    client2 = ioClient.connect('http://localhost:3000', options);
});

After(function() {
    client1.disconnect();
    client2.disconnect();
    server.closeServer();
});

AfterAll(function() {

});