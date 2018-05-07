var expect = require("chai").expect;
var indexJS = require("../index.js");

// file is included here:
console.log()
describe('testAdd',function () {
    it("should be 4+5 = 9",function(){
        expect(indexJS.testAdd(4,5)).to.equal(9);
    })
});