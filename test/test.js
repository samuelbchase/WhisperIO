// test/test.js
var intercept = require("intercept-stdout"),
    captured_text = "";
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

describe('User connections', function () {
    beforeEach(function() {
        sinon.stub(console, "log").returns(void 0);
        sinon.stub(console, "error").returns(void 0);
    });
    afterEach(function() {
        console.log.restore();
        console.error.restore();
    });
    var client1 = ioClient.connect('http://localhost:80', options);
    it('Is the server running?', function (done) {
        http.get('http://localhost:80', function (res) {
            assert.equal(200, res.statusCode);
            done();
        });
    });
    it('Can a client connect?', function (done) {
        // Set up client1 connection
        captured_text = "";
        var unhook_intercept = intercept(function(txt) {
            captured_text += txt;
        });
        client1.emit('testMsg', "this is a test");
        unhook_intercept();
        // Set up event listener.  This is the actual test we're running\
        assert(captured_text = "this is a test",'client is not connected');
        assert(captured_text != "blorp",'client is not connected');
        done();
    });

    it('Can a client send a login username?', function (done) {
        // Set up client1 connection
        captured_text = "";
        var unhook_intercept = intercept(function(txt) {
            captured_text += txt;
        });
        client1.emit('userNameSend', "Griffin");
        unhook_intercept();
        // Set up event listener.  This is the actual test we're running\
        assert(captured_text = "New User Connected: Griffin",'User successfully connected');
        assert(captured_text != "New User Connected: Joey",'User successfully connected');
        captured_text = "";
        done();
    });

});