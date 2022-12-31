const express = require('express');
const Item = require('../models/item')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const router = new express.Router()
const upload = require('../utils/upload')
const QRCode = require('qrcode')

// -----------------CRUD APIs-----------------//

//Create Item
router.post('/items', auth, async (req, res)=>{

    const item = new Item({
        ...req.body,
        owner: req.user._id
    })
    try {
        await item.save()
        res.status(201).send(item)
    } catch (error) {
        res.status(400).send(error)
    }
})

//Update Item
router.patch('/items/:id', auth, async(req, res) =>{

    const updates = Object.keys(req.body)
    const allowedUpdates = ['itemName', 'isLost']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation){
        res.status(400).send({error: 'Invalid updates'})
    }
    try {
        const item = await Item.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        if(!item){
            res.status(404).send();
        }
        res.send(item)
    } catch (error) {
        res.status(400).send();
    }
   
})

//Get All Items of a user
router.get('/items', auth, async(req, res) =>{

    try {
       await req.user.populate('items')
        res.send(req.user.items)
    } catch (error) {
        res.status(500).send(error)
    }
})

//Get Single Item By Id
router.get('/items/:id', auth, async(req, res)=>{
    const _id = req.params.id

    try {
        const item = await Item.findOne({
            _id,
            owner: req.user._id
        });

        if(!item){
            return res.status(400).send()
        }

        res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

//Delete Item
router.delete('/items/:id', auth, async(req, res)=>{
    const _id = req.params.id
    try {
        const item = await Item.findByIdAndDelete(_id)
        if(!item){
            res.status(404).send("Item Not Found")
        }
        res.send(item)
    } catch (error) {
        res.status(500).send(error)
    }
})

//Upload Item Picture
router.post('/items/itemPicture/:id', auth ,upload.single('itemPicture'), async(req, res)=>{
    const itemId = req.params.id
    const item = await Item.findById(itemId)
    if(!item){
        res.status(404).send()
    }
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer() 
    item.itemPicture = buffer
    await item.save()
    res.send()
}, (error, req, res, next)=>{
    res.status(400).send({error: error.message})
})

//Delete Item Picture
router.delete('/items/itemPicture/:id', auth, async(req, res) =>{
    const item = await Item.findById(req.params.id)
    if(!item){
        throw new Error()
    }
    item.itemPicture = undefined
    await item.save()
    res.send()
})

//Get Item Picture
router.get('/items/itemPicture/:id', async(req, res) =>{
    try {
        const item = await Item.findById(req.params.id)
        if(!item || !item.itemPicture){
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send(item.itemPicture)
    } catch (error) {
        res.status(404).send()
    }
})



//Get Item QRCode
router.get('/items/itemQRcode/:id', async(req, res) =>{
    try {
        const item = await Item.findById(req.params.id)
        if(!item || !item.itemPicture){
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send(item.itemQRCode)
    } catch (error) {
        res.status(404).send()
    }
})


module.exports = router