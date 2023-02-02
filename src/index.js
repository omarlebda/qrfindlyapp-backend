const express = require('express')
require('../db/mongoose');
const User = require('../models/user')
const userRouter = require('../routers/user')
const itemRouter = require('../routers/item')
const cors=require("cors");


const app = express()
const port = process.env.PORT || 3000


 


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



app.listen(port, ()=>{
    console.log("Server is running..." + port)
})


