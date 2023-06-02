const CRLF = "\r\n";
class serializeData {
  simpleString(str) {
    if(str.indexOf('\n') !== -1) throw new Error("Invalid simple string")
    return `+${str}\r\n`;
  }
  error(message) {
    return `-${message}\r\n`;
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
    if(!arrayData) return '*-1\r\n'
    let serializedArray = `*${arrayData.length}\r\n`;

    for (let i = 0; i < arrayData.length; i++) {
      if(arrayData[i] === null || arrayData[i] === undefined){
         serializedArray += this.bulkStrings(null);
         continue;
      }
      switch (typeof arrayData[i]) {
        case "string":
          if (arrayData[i][0] === '+') {
            serializedArray += this.simpleString(arrayData[i].slice(1));
          } else if (arrayData[i][0] === '-'){
            serializedArray += this.error(arrayData[i].slice(1))
          } else{
            serializedArray += this.bulkStrings(arrayData[i]);
          }
          break;
        case "number":
          serializedArray += this.integer(arrayData[i]);
          break;
        case "object":
          serializedArray += this.array(arrayData[i]);
          break;
      }
    }
    return serializedArray;
  }
}

class deserializeData {
  deserializer(buffer) {
    switch (String.fromCharCode(buffer[0])) {
      case "+":
        return this.simpleString(buffer);
      case ":":
        return this.integer(buffer);
      case "-":
        return this.error(buffer);
      case "$":
        return this.bulkStrings(buffer);
      case "*":
        return this.array(buffer);
    }
    // if the stream in not buffered
    switch (buffer[0]) {
      case "+":
        return this.simpleString(buffer);
      case ":":
        return this.integer(buffer);
      case "-":
        return this.error(buffer);
      case "$":
        return this.bulkStrings(buffer);
      case "*":
        return this.array(buffer);
    }


  }
  simpleString(buffer) {
    let crlfPos = buffer.indexOf(CRLF);
    if(buffer.toString().substring(1, crlfPos).indexOf('\n') !== -1) throw new Error("Invalid simple string")
    return { value: buffer.toString().substring(1, crlfPos), end: crlfPos + 2 };
  }
  integer(buffer) {
    let crlfPos = buffer.indexOf(CRLF);
    const numAsString = buffer.toString().substring(1, crlfPos)
    return {
      value:  numAsString.includes('.') ? parseFloat(numAsString) : parseInt(numAsString),
      end: crlfPos + 2,
    };
  }
  error(buffer) {
    let crlfPos = buffer.indexOf(CRLF);
    return { value: buffer.toString().substring(1, crlfPos), end: crlfPos + 2 };
  }
  bulkStrings(buffer) {
    let crlfPos = buffer.indexOf(CRLF);
    let strSize = parseInt(buffer.toString().substring(1, crlfPos));
    if (strSize < 0) return { value: null, end: crlfPos + 2 };
    return {
      value: buffer.toString().substring(crlfPos + 2, crlfPos + 2 + strSize),
      end: crlfPos + strSize + 4,
    };
  }
  array(buffer) {
    let crlfPos = buffer.indexOf(CRLF);
    let arraySize = parseInt(buffer.toString().substring(1, crlfPos));
    let arr = [];
    buffer = buffer.slice(crlfPos + 2);
    if (arraySize < 0) return { value: [null], end: crlfPos + 2 };
    while (arraySize) {
      let { value, end } = this.deserializer(buffer);
      arr.push(value);
      arraySize--;
      buffer = buffer.slice(end);
    }
    return { value: arr, end: buffer.length - 4};
  }
}

class controller extends serializeData {
  async commandsParser(value) {
    if (Array.isArray(value)) return await this.router(value);
    else return this.router([value]);
  }
  async router(value) {
    switch (value[0]) {
      case "myPing":
        return this.simpleString("PONG");
      case "testurl":
        if (!value[1])
          return this.error(
            "please type the url, EX.'testurl https://google.com' "
          );
        else return await this.testUrl(value[1]);
      default:
        return this.error("invalid command");
    }
  }
  async testUrl(value) {
    try {
      const response = await fetch(value);
      if (response.ok) return this.simpleString("true");
    } catch (error) {
      return this.simpleString("false");
    }
  }
}
module.exports = { serializeData, deserializeData, controller };
