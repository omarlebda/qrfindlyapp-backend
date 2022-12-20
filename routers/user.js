const express = require('express');
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const router = new express.Router()
const upload = require('../utils/upload')


// ------------------Auth------------------//

//User Signup
router.post('/users', async (req, res)=>{

    const user = new User(req.body);
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (error) {
        res.status(400).send(error)
    }
})


//User Login
router.post('/users/login', async(req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch (error) {
        res.status(400).send("error")
    }
})

//User Logout Of Current Session
router.post('/users/logout', auth, async(req, res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token != req.token
        })

        await req.user.save()
        res.send()

    } catch (error) {
        res.status(500).send()
    }
})


//User Logout Of All Sessions
router.post('/users/logoutAll', auth, async(req, res)=>{
    try {
        req.user.tokens = [];
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})



// -----------------CRUD APIs-----------------//


// Get Profile Info
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
});

// Update Profile Info
router.patch('/users/me', auth, async(req, res)=>{
    const updates = Object.keys(req.body);
    const allowedUpdates = ['firstName', 'lastName', 'location', 'about', 'email', 'password', 'age', ];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid updates'});
    }
    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user);
    } catch (error) {
        res.status(400).send(error)
    }
})



//Upload Avatar API
router.post('/users/me/avatar', auth ,upload.single('avatar'), async(req, res)=>{
    
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next)=>{
    res.status(400).send({error: error.message})
})


//Delete Avatar API
router.delete('/users/me/avatar', auth, async(req, res) =>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

//Get Avatar API
router.get('/users/:id/avatar', async(req, res) =>{

    try {
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
        
    } catch (error) {
        res.status(404).send()
    }
})





module.exports = router
