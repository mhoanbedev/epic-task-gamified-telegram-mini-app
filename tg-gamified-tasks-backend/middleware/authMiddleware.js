const User = require('../models/User'); 

const isAuthenticated = async (req, res, next) => {
  console.log('\n--- [authMiddleware] Running isAuthenticated ---');
  console.log('[authMiddleware] Session data:', req.session);  

  
  if (req.session && req.session.userId) {
    try {
   
      const user = await User.findById(req.session.userId).select('-__v');  

      if (!user) {
        console.log('[authMiddleware] User not found in DB for session userId. Destroying session.');
        
        req.session.destroy((err) => {
          if (err) console.error("Error destroying session:", err);
        });
        return res.status(401).json({ message: 'Unauthorized: Invalid session.' });
      }

       
      req.user = user; 
      console.log('[authMiddleware] User authenticated successfully. Attaching user to req.user.');
      next();  

    } catch (error) {
      console.error('[authMiddleware] Error finding user by session ID:', error);
      return res.status(500).json({ message: 'Internal Server Error during authentication.' });
    }
  } else {
    
    console.log('[authMiddleware] No valid session found.');
    return res.status(401).json({ message: 'Unauthorized: Please log in.' });
  }
};

module.exports = {
  isAuthenticated,
};