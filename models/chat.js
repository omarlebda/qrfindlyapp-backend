const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema({
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  lastMessageTimestamp: {
    type: Date,
    default: null
  }
});

const Chat = mongoose.model('Chat', chatSchema)

module.exports = Chat