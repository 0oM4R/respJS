

var net = require('net');
const buf = Buffer.from('buffer');
const {serializeData} = require('./helpers');
const s = new serializeData();
const {deserializeData} = require('./helpers'); 
const de = new deserializeData()
const server = net.createServer((socket) => {
 
  console.log("Connection from", socket.remoteAddress, "port", socket.remotePort)
  socket.on("data", (buffer) => {
    console.log(de.deserializer(buffer))
    socket.write('+PONG\r\n')
  })
  socket.on("end", () => {
    console.log("Closed", socket.remoteAddress, "port", socket.remotePort)
  })
})

server.maxConnections = 20
server.listen(6379)