const express = require('express')
const http = require('http');
const { Server } = require('socket.io');
require('../db/mongoose');
const User = require('../models/user')
const userRouter = require('../routers/user')
const itemRouter = require('../routers/item')
const cors=require("cors");


const app = express()
app.use(express.json())
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept, Authorization");

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
app.use(userRouter)
app.use(itemRouter)




const server = http.createServer(app);
const io = new Server(server,{
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
const port = process.env.PORT || 3000

//Socket Code
io.on('connection', (socket) => {
    console.log('A client connected');
  
    socket.on('disconnect', () => {
      console.log('A client disconnected');
    });
  
    // Listen for incoming messages from the client
    socket.on('message', (message) => {
      console.log('Received message from client:', message);
  
      // Broadcast the message to all connected clients
      io.emit('message', message);
    });
  });
 






  server.listen(port, ()=>{
    console.log("Server is running..." + port)
})


