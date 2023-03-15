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
        if (!user) {
            return res.status(401).send({ message: 'Invalid email or password' });
          }
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch (error) {
        res.status(500).send({ message: 'Internal server error' })
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
    const allowedUpdates = ['firstName', 'lastName', 
    'phoneNumber', 'location', 'about',
     'email', 'password', 'age', 
     'facebookLink', 'twitterLink', 
     'instagramLink', 'whatsappLink' ];
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



// POST /users/:userId/friends
router.post('/users/:userId/friends', async (req, res) => {
    try {
      const userId = req.params.userId;
      const friendId = req.body.friendId;
  
      const user = await User.findById(userId);
      const friend = await User.findById(friendId);
  
      if (!user || !friend) {
        return res.status(404).send();
      }
  
      user.friends.push(friend);
      await user.save();
      

      friend.friends.push(user); 
      await friend.save();


      res.status(201).send(user);
    } catch (e) {
      res.status(400).send(e);
    }
  });


  //Get User friends
  router.get('/users/:userId/friends', async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await User.findById(userId).populate('friends', '_id firstName lastName about');
      if (!user) {
        return res.status(404).send();
      }
      res.send(user.friends);
    } catch (e) {
      res.status(500).send(e);
    }
  });
  


  
  







module.exports = router
