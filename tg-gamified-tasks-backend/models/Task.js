const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MAX_XP_PER_TASK = 50;

const taskSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,  
    ref: 'User',  
    required: [true, 'Người sở hữu nhiệm vụ là bắt buộc'],
    index: true,  
  },
  title: {
    type: String,
    required: [true, 'Tiêu đề nhiệm vụ là bắt buộc'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  xpReward: {
    type: Number,
    default: 10,  
    min: 0,  
    max: [MAX_XP_PER_TASK, `XP thưởng không được vượt quá ${MAX_XP_PER_TASK}`]
  },
  deadline: {
    type: Date,  
  },
  completed: {
    type: Boolean,
    default: false,  
    index: true,  
  },
}, {
  timestamps: true, 
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;