const User = require('../models/User');  
const LeaderboardService = require('../services/leaderboardService');  

const telegramLoginOrRegister = async (req, res, next) => {
  console.log('\n--- [authController] Running telegramLoginOrRegister ---');
  console.log('[authController] Request Body:', req.body);
  const userData = req.body.user;  

  if (!userData || !userData.id) {
    return res.status(400).json({ message: 'Missing Telegram user data.' });
  }

  try {
    const telegramId = String(userData.id);  
    let user = await User.findOne({ telegramId: telegramId });
    let isNewUser = false;

    if (user) {
      console.log(`[authController] Found existing user: ${user.id}`);
      let updated = false;
      if (userData.username && user.username !== userData.username) {
        user.username = userData.username;
        updated = true;
      }
      if (userData.photo_url && user.avatar !== userData.photo_url) {
        user.avatar = userData.photo_url;
        updated = true;
      }
      if (updated) {
        await user.save();  
        console.log(`[authController] User ${user.id} info updated.`);
      }
    } else {
      console.log(`[authController] Creating new user for telegramId: ${telegramId}`);
      user = new User({
        telegramId: telegramId,
        username: userData.username,
        avatar: userData.photo_url,
      });
      await user.save();
      isNewUser = true;
      console.log(`[authController] New user created with ID: ${user.id}`);
      await LeaderboardService.updateScore(user.id, 0); 
    }
    req.session.userId = user.id;  
    req.session.save((err) => {
        if (err) {
            console.error('[authController] Error saving session:', err);
            return next(new Error('Failed to save session after login.')); 
        }
        console.log(`[authController] Session saved for userId: ${user.id}`);
        const userProfile = user.toObject();        
        res.status(isNewUser ? 201 : 200).json(userProfile); 
    });


  } catch (error) {
    console.error('[authController] Error during login/register:', error);
    next(error); 
  }
};

module.exports = {
  telegramLoginOrRegister,
};