const LeaderboardService = require('../services/leaderboardService');

const getLeaderboard = async (req, res, next) => {
    console.log('\n--- [leaderboardController] Running getLeaderboard ---');
    const limit = parseInt(req.query.limit, 10) || 10; 
  
    try {
      const leaderboard = await LeaderboardService.getTopUsers(limit); 
      res.status(200).json(leaderboard); 
    } catch (error) {
      console.error('[leaderboardController] Error fetching leaderboard:', error);
      next(error);
    }
  };

module.exports = {
  getLeaderboard,
};