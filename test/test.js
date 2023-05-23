const assert = require('assert');
const { expect } = require('chai');
const {serializeData,deserializeData,controller} = require('../src/helpers')
const SerializeData = new serializeData();
describe('serializeData', function () {
  describe('String', function () {
    it('should return "+PONG\\r\\n" that is PONG in RESP protocol', function () {
      assert.equal(SerializeData.simpleString("PONG"), "+PONG\r\n" );
    });
    it('should throw an error', function () {
     
      expect(()=>SerializeData.simpleString("PO\nNG")).to.throw(Error, 'Invalid simple string');
    });
  
  
  
  });
});