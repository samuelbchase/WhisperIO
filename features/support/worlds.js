// features/support/world.js
const { setWorldConstructor } = require('cucumber')
const file = require('./steps.js');

class CustomWorld {
    constructor() {
        file.startServer();
    }

    setMessage(msg) {
        this.variable = msg;
    }
}

setWorldConstructor(CustomWorld)