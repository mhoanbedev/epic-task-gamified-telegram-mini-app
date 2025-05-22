const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badgeController');



router.get('/', badgeController.getAllBadges);



module.exports = router;