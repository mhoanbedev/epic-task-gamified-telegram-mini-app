const Badge = require('../models/Badge');

const getAllBadges = async (req, res, next) => {
  console.log('\n--- [badgeController] Running getAllBadges ---');
  try {
    const badges = await Badge.find().sort({ title: 1 }); 
    res.status(200).json(badges);
  } catch (error) {
    console.error('[badgeController] Error fetching badges:', error);
    next(error);
  }
};
module.exports = {
  getAllBadges,
};