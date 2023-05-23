var net = require("net");
const buf = Buffer.from("buffer");
const { deserializeData, controller } = require("./helpers");
const Deserializer = new deserializeData();
const Controller = new controller();

const server = net.createServer(async (socket) => {
  console.log(
    "Connection from",
    socket.remoteAddress,
    "port",
    socket.remotePort
  );
  socket.on("data", async (buffer) => {
    let reply = await Controller.commandsParser(Deserializer.deserializer(buffer)?.value);
    socket.write(reply);
  });
  socket.on("end", () => {
    console.log("Closed", socket.remoteAddress, "port", socket.remotePort);
  });
});

server.maxConnections = 20;
server.listen(6379);
