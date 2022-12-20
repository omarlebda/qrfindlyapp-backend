const express = require('express')
require('../db/mongoose');
const User = require('../models/user')
const userRouter = require('../routers/user')
const itemRouter = require('../routers/item')

const app = express()
const port = process.env.PORT || 3000



app.use(express.json())
app.use(userRouter)
app.use(itemRouter)


app.listen(port, ()=>{
    console.log("Server is running..." + port)
})


