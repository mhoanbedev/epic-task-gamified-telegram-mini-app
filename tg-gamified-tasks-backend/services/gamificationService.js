const User = require('../models/User');
const Task = require('../models/Task');
const UserBadge = require('../models/UserBadge');
const Badge = require('../models/Badge');
const leaderboardService = require('./leaderboardService'); 


const LEVEL_XP_THRESHOLD = 100;  

 
const awardXp = async (userId, xpToAdd) => {
    console.log(`[GamificationService - Placeholder] Awarding ${xpToAdd} XP to ${userId}`);
    if (!userId || xpToAdd <= 0) return { user: null, leveledUp: false, newBadges: [] };

    try {
        const user = await User.findById(userId);
        if (!user) throw new Error(`User not found: ${userId}`);

        const oldLevel = user.level;
        const newXp = user.xp + xpToAdd;
        const newLevel = Math.floor(newXp / LEVEL_XP_THRESHOLD) + 1;

        user.xp = newXp;
        user.level = newLevel;
        await user.save();

        const leveledUp = newLevel > oldLevel;

       
        await leaderboardService.updateScore(userId, newXp);

       
        const completedTasksCount = await Task.countDocuments({ owner: userId, completed: true });
        const newBadges = await checkAndAwardBadges(userId, { level: newLevel, tasksCompleted: completedTasksCount });

        console.log(`[GamificationService] User ${userId} updated. Leveled up: ${leveledUp}. New Badges: ${newBadges.length}`);
        return { user, leveledUp, newBadges };

    } catch (err) {
        console.error(`[GamificationService] Error awarding XP to ${userId}:`, err);
       
        return { user: null, leveledUp: false, newBadges: [], error: err };
    }
};

 
const checkAndAwardBadges = async (userId, criteria) => {
    console.log(`[GamificationService - Placeholder] Checking badges for ${userId} with criteria:`, criteria);
    try {
        const existingUserBadges = await UserBadge.find({ user: userId }).select('badge -_id');
        const existingBadgeIds = existingUserBadges.map(ub => ub.badge);

        const potentialBadges = await Badge.find({ _id: { $nin: existingBadgeIds } });  

        const newlyAwardedBadges = [];
        for (const badge of potentialBadges) {
            let eligible = false;
            if (badge.milestoneType === 'tasksCompleted' && criteria.tasksCompleted >= badge.milestoneValue) {
                eligible = true;
            } else if (badge.milestoneType === 'levelReached' && criteria.level >= badge.milestoneValue) {
                eligible = true;
            }

            if (eligible) {
                console.log(`[GamificationService] Awarding badge "${badge.title}" to ${userId}`);
                await UserBadge.create({ user: userId, badge: badge._id });
                newlyAwardedBadges.push(badge);
            }
        }
        return newlyAwardedBadges;
    } catch (err) {
        console.error(`[GamificationService] Error checking/awarding badges for ${userId}:`, err);
        return [];
    }
};

module.exports = {
  awardXp,
  checkAndAwardBadges
};