class serialize {
  simpleString(str) {
    return `+${str}\r\n`;
  }
  error(message) {
    return `-ERR ${message}\r\n`;
  }
  integer(value) {
    return `:${value}`;
  }
  bulkStrings(bulkStrings) {
    if (bulkStrings === null) {
      return `$-1\r\n`;
    }
    else {
      return `$${bulkStrings.length}\r\n${bulkStrings}\r\n`;
    }
  }
}
