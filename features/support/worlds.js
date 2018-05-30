// features/support/world.js
const { setWorldConstructor } = require('cucumber');
const file = require('./steps.js');

class CustomWorld {
}

setWorldConstructor(CustomWorld);