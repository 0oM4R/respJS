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
    it('Simple error message', () => {
      assert.equal(
        SerializeData.error("ERR errorMessage"),
        "-ERR errorMessage\r\n"
      );
    });
    it("Not a simple string message", () => {
      assert.equal(
        SerializeData.error("ERR error\nMessage"),
        "-ERR error\nMessage\r\n"
      );
    });
  });
  describe("Integers", () => {
    it('Positive integer', () => {
      assert.equal(SerializeData.integer(5), ":5\r\n");
    });
    it('Negative integer"', () => {
      assert.equal(SerializeData.integer(-2), ":-2\r\n");
    });
    it('Float', () => {
      assert.equal(SerializeData.integer(2.5), ":2.5\r\n");
    });
  });
  describe("Bulk string", () => {
    it('Hello"', () => {
      assert.equal(SerializeData.bulkStrings('hello'),'$5\r\nhello\r\n')
    })
    it('Empty string', ()=>{
      assert.equal(SerializeData.bulkStrings(''),"$0\r\n\r\n")
    })
    it('Null value', ()=>{
      assert.equal(SerializeData.bulkStrings(null), "$-1\r\n")
    })
  })
  describe("Array", () => {
    it('Empty array, should return "*0\\r\\n"', () => {
      assert.equal(SerializeData.array([]),"*0\r\n")
    })
    it('Hello world, as bulk string', () => {
      assert.equal(SerializeData.array(["hello","world"]),"*2\r\n$5\r\nhello\r\n$5\r\nworld\r\n")
    })
    it('Hello world, as simple string', () => {
      assert.equal(SerializeData.array(["+hello","+world"]), "*2\r\n+hello\r\n+world\r\n")
    })
    it('Array of integers', () => {
      assert.equal(SerializeData.array([1,2,3]),"*3\r\n:1\r\n:2\r\n:3\r\n")
    })
    it("Mixed types",()=>{
      assert.equal(SerializeData.array([1,2,3,4,"hello","+world"]),"*6\r\n:1\r\n:2\r\n:3\r\n:4\r\n$5\r\nhello\r\n+world\r\n")
    })
    it("Null array", () => {
      assert.equal(SerializeData.array(),"*-1\r\n")
    })
    it("Nested arrays", () => {
      assert.equal(SerializeData.array([[1,2,3],["+Hello","-World"]]),"*2\r\n*3\r\n:1\r\n:2\r\n:3\r\n*2\r\n+Hello\r\n-World\r\n")
    })
    it("Null element inside array", () => {
      assert.equal(SerializeData.array(["hello", null ,"world"]),"*3\r\n$5\r\nhello\r\n$-1\r\n$5\r\nworld\r\n")
    })

  })
});
