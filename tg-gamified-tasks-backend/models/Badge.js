const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const badgeSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Tên huy hiệu là bắt buộc'],
    unique: true,  
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Mô tả huy hiệu là bắt buộc'],
    trim: true,
  },
  icon: {
    type: String, 
  },
  milestoneType: {
    type: String,
    required: [true, 'Loại cột mốc là bắt buộc'],
    enum: { 
      values: ['tasksCompleted', 'levelReached'],
      message: '{VALUE} không phải là loại cột mốc hợp lệ (tasksCompleted, levelReached)',
    },
  },
  milestoneValue: {
    type: Number,
    required: [true, 'Giá trị cột mốc là bắt buộc'],
    min: 1, 
  },
}, {
  timestamps: true,
});

const Badge = mongoose.model('Badge', badgeSchema);
module.exports = Badge;