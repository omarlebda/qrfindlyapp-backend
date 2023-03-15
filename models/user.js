const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true,
    },
    location: {
        type: String
    },
    phoneNumber: {
        type: String
    },
    about: {
        type: String
    },
    facebookLink: {
        type: String
    },
    instagramLink: {
        type: String
    },
    twitterLink: {
        type: String
    },
    whatsappLink: {
        type: String
    },
    age: {
        type: Number,
    },
    isVerified: {
        type: Boolean,
        default: false
    },

    email: {
        type: String,
        required: true,
        unique: true,
        validate(value){
           if(!validator.isEmail(value)){
            throw new Error('Email is invalid')
           }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value){
            if(validator.contains(value, ['password'])){
                throw new Error('Password can\'t have the word password inside it')
            }
        },
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    chats: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
    }]
}, {
    timestamps: true
})

userSchema.virtual('items', {
    ref: 'Item',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, 'lebdoush')

    user.tokens = user.tokens.concat({token})
    await user.save()
    return token

}


userSchema.methods.toJSON = function(){
    const user = this
    const userObject = this.toObject()

    delete userObject.password
    delete userObject.tokens
    //delete userObject.avatar
    return userObject
}


userSchema.statics.findByCredentials = async (email, password) =>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error('Unable to login')
    }

    return user
}

userSchema.pre('save', async function(next){
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

const User = mongoose.model('User', userSchema)


module.exports = User