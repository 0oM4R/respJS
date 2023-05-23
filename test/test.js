const assert = require("assert");
const { expect } = require("chai");
const {
  serializeData,
  deserializeData,
  controller,
} = require("../src/helpers");
const { ServerResponse } = require("http");
const SerializeData = new serializeData();
describe("serializeData", () => {
  describe("String", () => {
    it('should return "+PONG\\r\\n" that is PONG in RESP protocol', () => {
      assert.equal(SerializeData.simpleString("PONG"), "+PONG\r\n");
    });
    it("should throw an error", () => {
      expect(() => SerializeData.simpleString("PO\nNG")).to.throw(
        Error,
        "Invalid simple string"
      );
    });
  });
  describe("Error", () => {
    it('Should return "-ERR errorMessage\\r\\n"', () => {
      assert.equal(
        SerializeData.error("errorMessage"),
        "-ERR errorMessage\r\n"
      );
    });
    it("Not a simple string message", () => {
      assert.equal(
        SerializeData.error("error\nMessage"),
        "-ERR error\nMessage\r\n"
      );
    });
  });
  describe("Integers", () => {
    it('Should return ":5\\r\\n"', () => {
      assert.equal(SerializeData.integer(5), ":5\r\n");
    });
    it('Negative integer; Should return ":-2\\r\\n"', () => {
      assert.equal(SerializeData.integer(-2), ":-2\r\n");
    });
    it('Float; Should return ":2.5\\r\\n"', () => {
      assert.equal(SerializeData.integer(2.5), ":2.5\r\n");
    });
  });
  describe("Bulk string", () => {
    it('Should return "$5\\r\\nhello\\r\\n"', () => {
      assert.equal(SerializeData.bulkStrings('hello'),'$5\r\nhello\r\n')
    })
    it('empty string; should return "$0\\r\\n\\r\\n"', ()=>{
      assert.equal(SerializeData.bulkStrings(''),"$0\r\n\r\n")
    })
    it('null value; should return "$-1\\r\\n"', ()=>{
      assert.equal(SerializeData.bulkStrings(null), "$-1\r\n")
    })
    
  })
});
