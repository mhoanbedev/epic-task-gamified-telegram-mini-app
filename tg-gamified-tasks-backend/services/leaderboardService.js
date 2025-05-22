 const Redis = require('ioredis');
require('dotenv').config();
const User = require('../models/User');

 
const redisClient = new Redis(process.env.REDIS_URL);

redisClient.on('error', (err) => console.error('Redis Client Error in LeaderboardService:', err));
redisClient.on('connect', () => console.log('Redis client connected for LeaderboardService'));

const LEADERBOARD_KEY = 'leaderboard:xp';

 
const updateScore = async (userId, score) => {
  console.log(`[LeaderboardService - Placeholder] Updating score for ${userId} to ${score}`);
  try {
    await redisClient.zadd(LEADERBOARD_KEY, score, String(userId));  
  } catch (err) {
    console.error(`[LeaderboardService] Error updating score for ${userId}:`, err);
  }
};

const getUserRankAndScore = async (userId) => {
  console.log(`[LeaderboardService - Placeholder] Getting rank for ${userId}`);
   try {
     const rank = await redisClient.zrevrank(LEADERBOARD_KEY, String(userId));
     const score = await redisClient.zscore(LEADERBOARD_KEY, String(userId));
     return {
        rank: rank !== null ? rank + 1 : null,
        score: score !== null ? parseInt(score, 10) : null
     };
  } catch (err) {
     console.error(`[LeaderboardService] Error getting rank/score for ${userId}:`, err);
     return { rank: null, score: null };
  }
};

 
const getTopUsers = async (limit = 10) => {
    console.log(`[LeaderboardService] Getting top ${limit} users`);
    try {
       
      const results = await redisClient.zrevrange(LEADERBOARD_KEY, 0, limit - 1, 'WITHSCORES');
       
  
      if (!results || results.length === 0) {
        console.log('[LeaderboardService] Leaderboard is empty.');
        return [];  
      }
  
   
      const userIds = [];
      const scores = {};
      for (let i = 0; i < results.length; i += 2) {
        const userId = results[i];  
        const score = parseInt(results[i + 1], 10);
        userIds.push(userId);
        scores[userId] = score;
      }
  
       
      console.log(`[LeaderboardService] Fetching user details from MongoDB for ${userIds.length} users.`);
      
      const users = await User.find({ _id: { $in: userIds } })
                              .select('username avatar')  
                              .lean();  
  
      
      const usersById = users.reduce((map, user) => {
          map[user._id.toString()] = user; 
          return map;
      }, {});
      console.log(`[LeaderboardService] Found ${users.length} matching users in MongoDB.`);
  
    
      const finalLeaderboard = [];
      let rank = 1;
      for (const userId of userIds) {  
        const userDetails = usersById[userId];  
        const userScore = scores[userId];      
  
        if (userDetails) {  
          finalLeaderboard.push({
            rank: rank++,
            userId: userId,  
            score: userScore,  
            username: userDetails.username,  
            avatar: userDetails.avatar,      
          });
        } else {
          
          console.warn(`[LeaderboardService] User ${userId} found in Redis leaderboard but not in MongoDB collection 'users'. Skipping.`);
           
        }
      }
  
      console.log(`[LeaderboardService] Returning leaderboard with ${finalLeaderboard.length} users.`);
      return finalLeaderboard;
  
    } catch (err) {
      console.error(`[LeaderboardService] Error getting top users:`, err);
      
      return [];  
    }
  };


module.exports = {
  updateScore,
  getUserRankAndScore,
  getTopUsers, 
};