const mongoose = require('mongoose')
const validator = require('validator')
const QRCode = require('qrcode')
const sharp = require('sharp')

const itemSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true
    },
    itemPicture:{
        type: Buffer
    },
    itemQRCode:{
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


// --------pre save to be checked later -----------
itemSchema.pre('save', async function(next){
    const item = this
    let obj = {
        name: this.itemName,
        age:27,
        department:"Police",
        id:"aisuoiqu3234738jdhf100223"
    }

    let stringdata = JSON.stringify(obj)
    try {
        const generateQR = await QRCode.toDataURL(stringdata, { errorCorrectionLevel: 'M' })
        var buffer = Buffer.from(generateQR.split(",")[1], 'base64'); 
        item.itemQRCode = buffer;
        next()
    } catch (error) {
        next(error)
    }
   
    
})

const Item = mongoose.model('Item', itemSchema)


module.exports = Item;