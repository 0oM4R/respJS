const assert = require("assert");
const { expect } = require("chai");
const {
  serializeData,
  deserializeData,
  controller,
} = require("../src/helpers");
const SerializeData = new serializeData();
const DeserializeData = new deserializeData();
const Controller = new controller();
describe("Serialize data", () => {
  describe("String", () => {
    it("PONG", () => {
      assert.equal(SerializeData.simpleString("PONG"), "+PONG\r\n");
    });
    it("Error: Invalid simple string", () => {
      expect(() => SerializeData.simpleString("PO\nNG")).to.throw(
        Error,
        "Invalid simple string"
      );
    });
  });
  describe("Error", () => {
    it("Simple error message", () => {
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
    it("Positive integer", () => {
      assert.equal(SerializeData.integer(5), ":5\r\n");
    });
    it('Negative integer"', () => {
      assert.equal(SerializeData.integer(-2), ":-2\r\n");
    });
    it("Float", () => {
      assert.equal(SerializeData.integer(2.5), ":2.5\r\n");
    });
  });
  describe("Bulk string", () => {
    it('Hello"', () => {
      assert.equal(SerializeData.bulkStrings("hello"), "$5\r\nhello\r\n");
    });
    it("Empty string", () => {
      assert.equal(SerializeData.bulkStrings(""), "$0\r\n\r\n");
    });
    it("Null value", () => {
      assert.equal(SerializeData.bulkStrings(null), "$-1\r\n");
    });
  });
  describe("Array", () => {
    it('Empty array, should return "*0\\r\\n"', () => {
      assert.equal(SerializeData.array([]), "*0\r\n");
    });
    it("Hello world, as bulk string", () => {
      assert.equal(
        SerializeData.array(["hello", "world"]),
        "*2\r\n$5\r\nhello\r\n$5\r\nworld\r\n"
      );
    });
    it("Hello world, as simple string", () => {
      assert.equal(
        SerializeData.array(["+hello", "+world"]),
        "*2\r\n+hello\r\n+world\r\n"
      );
    });
    it("Array of integers", () => {
      assert.equal(SerializeData.array([1, 2, 3]), "*3\r\n:1\r\n:2\r\n:3\r\n");
    });
    it("Mixed types", () => {
      assert.equal(
        SerializeData.array([1, 2, 3, 4, "hello", "+world"]),
        "*6\r\n:1\r\n:2\r\n:3\r\n:4\r\n$5\r\nhello\r\n+world\r\n"
      );
    });
    it("Null array", () => {
      assert.equal(SerializeData.array(), "*-1\r\n");
    });
    it("Nested arrays", () => {
      assert.equal(
        SerializeData.array([
          [1, 2, 3],
          ["+Hello", "-World"],
        ]),
        "*2\r\n*3\r\n:1\r\n:2\r\n:3\r\n*2\r\n+Hello\r\n-World\r\n"
      );
    });
    it("Null element inside array", () => {
      assert.equal(
        SerializeData.array(["hello", null, "world"]),
        "*3\r\n$5\r\nhello\r\n$-1\r\n$5\r\nworld\r\n"
      );
    });
  });
});
describe("Deserialization", () => {
  describe("String", () => {
    it("PONG", () => {
      assert.equal(DeserializeData.simpleString("+PONG\r\n").value, "PONG");
    });
    it("Invalid simple string", () => {
      expect(() => DeserializeData.simpleString("PO\nNG\r\n").value).to.throw(
        Error,
        "Invalid simple string"
      );
    });
  });
  describe("Error", () => {
    it("Simple error message", () => {
      assert.equal(
        DeserializeData.error("-ERR errorMessage\r\n").value,
        "ERR errorMessage"
      );
    });
  });
  describe("Integer", () => {
    it("Not a simple string message", () => {
      assert.equal(
        DeserializeData.error("-ERR error\nMessage\r\n").value,
        "ERR error\nMessage"
      );
    });
    it("Positive integer", () => {
      assert.equal(DeserializeData.integer(":5\r\n").value, 5);
    });
    it('Negative integer"', () => {
      assert.equal(DeserializeData.integer(":-2\r\n").value, -2);
    });
    it("Float", () => {
      assert.equal(DeserializeData.integer(":2.5\r\n").value, 2.5);
    });
  });
  describe("Bulk string", () => {
    it('Hello"', () => {
      assert.equal(
        DeserializeData.bulkStrings("$5\r\nhello\r\n").value,
        "hello"
      );
    });
    it("Empty string", () => {
      assert.equal(DeserializeData.bulkStrings("$0\r\n\r\n").value, "");
    });
    it("Null value", () => {
      assert.equal(DeserializeData.bulkStrings("$-1\r\n").value, null);
    });
  });
  describe("Array", () => {
    it('Empty array, should return "*0\\r\\n"', () => {
      assert.deepEqual(DeserializeData.array(Buffer.from("*0\r\n")).value, []);
    });
    it("Hello world, as bulk string", () => {
      assert.deepEqual(
        DeserializeData.array(
          Buffer.from("*2\r\n$5\r\nhello\r\n$5\r\nworld\r\n")
        ).value,
        ["hello", "world"]
      );
    });
    it("Hello world, as simple string", () => {
      assert.deepEqual(
        DeserializeData.array(Buffer.from("*2\r\n+hello\r\n+world\r\n")).value,
        ["hello", "world"]
      );
    });
    it("Array of integers", () => {
      assert.deepEqual(
        DeserializeData.array(Buffer.from("*3\r\n:1\r\n:2\r\n:3\r\n")).value,
        [1, 2, 3]
      );
    });
    it("Mixed types", () => {
      assert.deepEqual(
        DeserializeData.array(
          Buffer.from("*6\r\n:1\r\n:2\r\n:3\r\n:4\r\n$5\r\nhello\r\n+world\r\n")
        ).value,
        [1, 2, 3, 4, "hello", "world"]
      );
    });
    it("Null array", () => {
      assert.deepEqual(DeserializeData.array(Buffer.from("*-1\r\n")).value, [
        null,
      ]);
    });
    it("Nested arrays", () => {
      assert.deepEqual(
        DeserializeData.array(
          Buffer.from(
            "*2\r\n*3\r\n:1\r\n:2\r\n:3\r\n*2\r\n+Hello\r\n-World\r\n"
          )
        ).value,
        [
          [1, 2, 3],
          ["Hello", "World"],
        ]
      );
    });
    it("Null element inside array", () => {
      assert.deepEqual(
        DeserializeData.array(
          Buffer.from("*3\r\n$5\r\nhello\r\n$-1\r\n$5\r\nworld\r\n")
        ).value,
        ["hello", null, "world"]
      );
    });
  });
});
describe("Custom commands", ()=>{
  describe("myPing command", ()=>{
    let buffered = Buffer.from("*1\r\n+myPing\r\n")
    it("Sending myPing command",async ()=>{
      assert.equal( await Controller.commandsParser(DeserializeData.deserializer(buffered).value) , '+PONG\r\n')
    }),
    it("sending invalid command", async ()=>{
      let buffered = Buffer.from("*1\r\n+Ping\r\n")
      assert.equal( await Controller.commandsParser(DeserializeData.deserializer(buffered).value) , '-invalid command\r\n')
    })
  });
  describe("test url command", ()=>{                         
    it("testing example.com", async ()=>{
      let buffered = Buffer.from("*2\r\n+testurl\r\n\$19\r\nhttps://example.com\r\n")
      assert.equal( await Controller.commandsParser(DeserializeData.deserializer(buffered).value) , '+true\r\n')
    }),
    it("testing invalid url", async ()=>{
      let buffered = Buffer.from("*2\r\n+testurl\r\n\$17\r\nhtps://eample.com\r\n")
      assert.equal( await Controller.commandsParser(DeserializeData.deserializer(buffered).value) , '+false\r\n')
    }),
    it("sending test url command without parameter",async ()=>{
      let buffered = Buffer.from("*1\r\n+testurl\r\n")
      assert.equal( await Controller.commandsParser(DeserializeData.deserializer(buffered).value) , "-please type the url, EX.'testurl https://google.com' \r\n")
    })
  })
})
