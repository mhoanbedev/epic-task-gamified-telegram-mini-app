const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userBadgeSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',  
    required: true,
    index: true,
  },
  badge: {
    type: Schema.Types.ObjectId,
    ref: 'Badge',  
    required: true,
    index: true,
  },
  
}, {
  timestamps: true, 
});


userBadgeSchema.index({ user: 1, badge: 1 }, { unique: true });

const UserBadge = mongoose.model('UserBadge', userBadgeSchema);
module.exports = UserBadge;