const request = require("supertest")
const app = require("../service.js")

test("Test now ",() => {
    expect('hello there').toBe("hello there");

});


test("Test function, dummy",()=> {

    let object = null;
    expect(object).toBeDefined();

})