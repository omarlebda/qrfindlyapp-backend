const mongoose = require('mongoose')
const validator = require('validator')



const itemSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true
    },
    itemPicture:{
        type: Buffer
    },
    isLost: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})



const Item = mongoose.model('Item', ItemSchema)


module.exports = Item;