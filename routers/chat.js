const express = require('express');
const User = require('../models/user')
const Chat = require('../models/chat')
const Message = require('../models/message')
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth')
const router = new express.Router()


// POST: Create a chat
router.post('/chats', async (req, res) => {
    const { user1Id, user2Id } = req.body;
    
    // Check if both users exist
    const user1 = await User.findById(user1Id);
    const user2 = await User.findById(user2Id);

    if (!user1 || !user2) {
        return res.status(404).json({ message: 'One or both users not found' });
    }
    // Check if chat already exists between users
    const existingChat = await Chat.findOne({
      members: { $all: [user1Id, user2Id] }
    });
  
    if (existingChat) {
      return res.status(400).json({ message: 'Chat already exists between users' });
    }
  
    // Create new chat
    const newChat = new Chat({ members: [user1Id, user2Id] });
    await newChat.save();
  
    return res.status(201).json({ chatId: newChat._id });
  });




  //POST: send a message from one user to another
  router.post('/chats/:chatId/messages', async (req, res) => {
    const { chatId } = req.params;
    const { senderId, receiverId, message } = req.body;
  
    // Check if both users exist
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);
  
    if (!sender || !receiver) {
      return res.status(404).json({ message: 'One or both users not found' });
    }
  
    // Check if chat exists between users
    const chat = await Chat.findById(chatId);
  
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
  
    if (!chat.members.includes(senderId) || !chat.members.includes(receiverId)) {
      return res.status(400).json({ message: 'Users not in chat' });
    }
  
     // Create new message and add it to chat's messages array
     const newMessage = new Message({ senderId, receiverId, message });
     chat.messages.push(newMessage);
     chat.lastMessageTimestamp = newMessage.timestamp;
     await Promise.all([newMessage.save(), chat.save()]);
  
    return res.status(201).json({ messageId: newMessage._id });
  });




  //GET: get all chats of a user 
  router.get('/chats/:userId', async (req, res) => {
    try {
      const chats = await Chat.find({ members: req.params.userId })
        .populate('members', 'firstName lastName avatar')
        .populate('messages')
        .sort({ lastMessageTimestamp: -1 })
        .exec();
  
      const chatsWithLastMessage = chats.map(chat => {
        const lastMessage = chat.messages[chat.messages.length - 1];
        const otherMember = chat.members.find(member => member._id.toString() !== req.params.userId);
        return {
          chatId: chat._id,
          otherMember,
          lastMessage: {
            message: lastMessage.message,
            senderId: lastMessage.senderId,
            receiverId: lastMessage.receiverId,
            timestamp: lastMessage.timestamp
          }
        };
      }).sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);
      
      res.json(chatsWithLastMessage);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });





  


  module.exports = router
