# respJS

## Introduction

This code is a simple implementation of a TCP server that handles Redis-like commands. It listens on port 6379 and uses the net module in Node.js to create a TCP server. When a client connects, it logs the connection details and handles incoming data.

requirements:

This code is based on some node.js modules so make sure you have [Node.js](https://nodejs.org/en/download) installed

## Installation

You can clone the repository and run the server with the following command:

- `git clone https://github.com/0oM4R/respJS.git`
- `yarn` to install some small dependencies
- `yarn start` to start the server

## Testing

You can run the tests using `npm test`

## Usage

### Using redis-cli

open the redis-cli on your terminal by typing `redis-cli`

```bash

127.0.0.1:6379> myPing
PONG
127.0.0.1:6379> testurl https://google.com
true
(0.51s)

```

### Using netcat

```bash
echo -e "*1\r\n+myPing\r\n" | netcat localhost 6379
+PONG
```

```bash
echo -e "*2\r\n+testurl\r\n\$18\r\nhttps://google.com\r\n" | netcat localhost 6379
+true

```

## Description

The code consists of several classes and helper functions:

The serializeData class provides methods for serializing different types of data into Redis protocol format. It includes methods for handling simple strings, errors, integers, bulk strings, and arrays.

The deserializeData class provides methods for deserializing data received from clients. It can parse and convert Redis protocol-formatted data back into JavaScript objects. It handles different Redis data types such as simple strings, integers, errors, bulk strings, and arrays.

The controller class extends the serializeData class and acts as a command router. It receives deserialized commands from clients and performs specific actions based on the command type. It includes a commandsParser method for parsing and routing commands. Currently, it supports the `myPing` and `testurl` commands.

The main part of the code creates a TCP server using net.createServer(). It listens for incoming connections and handles data received from clients. When data is received, it deserializes it using the deserializeData class, passes it to the controller class for processing, and sends back a serialized response to the client.

You can start the server by running the script, and it will listen on port 6379. Clients can connect to the server and send Redis-like commands, which will be processed and responded to accordingly.

Note: This code assumes the presence of additional dependencies and modules, such as fetch for the "testurl" command. Make sure to install and include any required dependencies before running the code.

