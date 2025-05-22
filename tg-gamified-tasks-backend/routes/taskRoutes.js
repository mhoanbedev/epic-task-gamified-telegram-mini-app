const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware'); 


router.use(authMiddleware.isAuthenticated);

 
router.post('/', taskController.createTask);         
router.get('/', taskController.getUserTasks);          
router.get('/:id', taskController.getTaskById);        
router.patch('/:id', taskController.updateTask);      
router.delete('/:id', taskController.deleteTask);     


router.post('/:id/complete', taskController.completeTask);

module.exports = router;