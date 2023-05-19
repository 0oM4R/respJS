const CRLF = "\r\n"
class serializeData {
  simpleString(str) {
    return `+${str}\r\n`;
  }
  error(message) {
    return `-ERR ${message}\r\n`;
  }
  integer(value) {
    return `:${value}\r\n`;
  }
  bulkStrings(bulkStrings) {
    if (bulkStrings === null) {
      return `$-1\r\n`;
    } else {
      return `$${bulkStrings.length}\r\n${bulkStrings}\r\n`;
    }
  }
  array(arrayData) {
    let serializedArray = `*${arrayData.length}\r\n`;
    for (let i = 0; i < arrayData.length; i++) {
      switch (typeof arrayData[i]) {
        case "string":
          if (arrayData[i].includes("\n") || arrayData[i].includes("\r")) {
            serializedArray += this.bulkStrings(arrayData[i]);
          } else {
            serializedArray += this.simpleString(arrayData[i]);
          }
          break;
        case "number":
          serializedArray += this.integer(arrayData[i])
          break;
        case "object":
          serializedArray += this.array(arrayData[i])
          break;
      }
    }
    return serializedArray;
  }
}

class deserializeData{ 

  deserializer(buffer){
    if (String.fromCharCode(buffer[0])=== '+'){
      return this.simpleString(buffer)
    }else{
      console.log("Invalid",buffer.toString("binary"))
    }
  }
  simpleString(buffer){
    let crlfPos = buffer.indexOf(CRLF);
    return buffer.toString().substring(1,crlfPos);
  }
}
module.exports = {serializeData, deserializeData};
