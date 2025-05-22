
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  telegramId: {
    type: String,
    required: [true, 'Telegram ID là bắt buộc'], 
    unique: true,  
    index: true,  
  },
  username: {
    type: String,
    trim: true,  
  },
  avatar: {
    type: String,  
  },
  level: {
    type: Number,
    default: 1,  
    min: 1,  
  },
  xp: {
    type: Number,
    default: 0,  
    min: 0,  
  },
  
}, {
  timestamps: true,
 
});


const User = mongoose.model('User', userSchema);  
module.exports = User;