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

itemSchema.pre('save', async function(next){
    const item = this
    let obj = {
        name:"Employee Name",
        age:27,
        department:"Police",
        id:"aisuoiqu3234738jdhf100223"
    }

    let stringdata = JSON.stringify(obj)

    // Converting the data into base64
    await QRCode.toDataURL(stringdata, async function (err, code) {
        if(err) return console.log("error occurred")
        var string = code
        var regex = /^data:.+\/(.+);base64,(.*)$/;
        var matches = string.match(regex);
        var ext = matches[1];
        var data = matches[2];
        var buffer = Buffer.from(data, 'base64');
        var buffer2 = await sharp(buffer).resize({width: 250, height: 250}).png().toBuffer()
        item.itemQRCoder = buffer2;
        console.log(item.itemQRCoder)
    })
    
    
    next()
})

const Item = mongoose.model('Item', itemSchema)


module.exports = Item;