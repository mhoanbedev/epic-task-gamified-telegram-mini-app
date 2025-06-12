const Task = require('../models/Task');
const GamificationService = require('../services/gamificationService'); 

const MAX_TASKS_PER_DAY = 5

const createTask = async (req, res, next) => {
    console.log('\n--- [taskController] Running createTask ---');
    console.log('[taskController] Request Body:', req.body);
    console.log('[taskController] User:', req.user);  

    const { title, description, deadline, xpReward } = req.body;
    const ownerId = req.user.id; 

    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));  
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));  

        const tasksCreatedToday = await Task.countDocuments({
            owner: ownerId,
            createdAt: { 
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        console.log(`[taskController] User ${ownerId} đã tạo ${tasksCreatedToday} tasks hôm nay.`);

        if (!title) {
            return res.status(400).json({ message: 'Task title is required.' });
        }

        const newTask = new Task({
            owner: ownerId,
            title,
            description,
            deadline,  
            xpReward: xpReward,  
        });

        await newTask.save();
        console.log('[taskController] Task created:', newTask._id);
        res.status(201).json(newTask);

    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        console.error('[taskController] Error creating task:', error);
        next(error);  
    }
};

const getUserTasks = async (req, res, next) => {
    console.log('\n--- [taskController] Running getUserTasks ---');
    console.log('[taskController] User:', req.user);
    const ownerId = req.user.id;
    const { completed } = req.query;  

    try {
         const query = { owner: ownerId };
         if (completed !== undefined) {
             query.completed = completed === 'true';  
         }
         const tasks = await Task.find(query).sort({ createdAt: -1 });  
         res.status(200).json(tasks);
    } catch (error) {
         console.error('[taskController] Error fetching tasks:', error);
         next(error);
    }
};

const getTaskById = async (req, res, next) => {
    console.log('\n--- [taskController] Running getTaskById ---');
    console.log('[taskController] Task ID:', req.params.id);
    console.log('[taskController] User:', req.user);
     const taskId = req.params.id;
     const ownerId = req.user.id;

     try {
         const task = await Task.findOne({ _id: taskId, owner: ownerId });  
         if (!task) {
             return res.status(404).json({ message: 'Task not found or you do not have permission.' });
         }
         res.status(200).json(task);
     } catch (error) {
       
        if (error.name === 'CastError') { 
             return res.status(400).json({ message: 'Invalid Task ID format.' });
        }
         console.error('[taskController] Error fetching task by ID:', error);
         next(error);
     }
};

const updateTask = async (req, res, next) => {
    console.log('\n--- [taskController] Running updateTask ---');
    console.log('[taskController] Task ID:', req.params.id);
    console.log('[taskController] Request Body:', req.body);
    console.log('[taskController] User:', req.user);
    const taskId = req.params.id;
    const ownerId = req.user.id;
    const { title, description, deadline } = req.body;  

   
     if (req.body.completed !== undefined || req.body.xpReward !== undefined || req.body.owner !== undefined) {
        return res.status(400).json({ message: 'Cannot update completed status, XP reward, or owner via this endpoint.' });
     }

     try {
        const task = await Task.findOne({ _id: taskId, owner: ownerId });
        if (!task) {
            return res.status(404).json({ message: 'Task not found or you do not have permission.' });
        }
        if (task.completed) {
            return res.status(400).json({ message: 'Cannot update a completed task.' });
        }

     
        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (deadline !== undefined) task.deadline = deadline;  

        await task.save();
        res.status(200).json(task);

     } catch (error) {
         if (error.name === 'CastError') { 
             return res.status(400).json({ message: 'Invalid Task ID format.' });
         }
        console.error('[taskController] Error updating task:', error);
        next(error);
     }
};

const deleteTask = async (req, res, next) => {
    console.log('\n--- [taskController] Running deleteTask ---');
    console.log('[taskController] Task ID:', req.params.id);
    console.log('[taskController] User:', req.user);
    const taskId = req.params.id;
    const ownerId = req.user.id;

    try {
        const task = await Task.findOne({ _id: taskId, owner: ownerId });
        if (!task) {
            return res.status(404).json({ message: 'Task not found or you do not have permission.' });
        }
        if (task.completed) {
            return res.status(400).json({ message: 'Cannot delete a completed task.' });
        }

        await Task.deleteOne({ _id: taskId, owner: ownerId });  
        res.status(200).json({ message: 'Task deleted successfully.' });  

    } catch (error) {
        if (error.name === 'CastError') { 
            return res.status(400).json({ message: 'Invalid Task ID format.' });
        }
        console.error('[taskController] Error deleting task:', error);
        next(error);
    }
};

const completeTask = async (req, res, next) => {
    console.log('\n--- [taskController] Running completeTask ---');
    console.log('[taskController] Task ID:', req.params.id);
    console.log('[taskController] User:', req.user);
    const taskId = req.params.id;
    const ownerId = req.user.id;

    try {
         const task = await Task.findOne({ _id: taskId, owner: ownerId });
         if (!task) {
             return res.status(404).json({ message: 'Task not found or you do not have permission.' });
         }
         if (task.completed) {
             return res.status(400).json({ message: 'Task is already completed.' });
         }
         task.completed = true;
         await task.save();     
         const gamificationResult = await GamificationService.awardXp(ownerId, task.xpReward);     
         if(gamificationResult.error){
             console.error("[taskController] Error from GamificationService but task marked complete:", gamificationResult.error);
         }

         res.status(200).json({
             message: 'Task marked as complete!',
             task: task,  
             xpAwarded: task.xpReward,
             leveledUp: gamificationResult.leveledUp,
             newLevel: gamificationResult.user?.level, 
             newBadges: gamificationResult.newBadges
         });

    } catch (error) {
         if (error.name === 'CastError') { 
             return res.status(400).json({ message: 'Invalid Task ID format.' });
         }
        console.error('[taskController] Error completing task:', error);
        next(error);
    }
};



module.exports = {
  createTask,
  getUserTasks,
  getTaskById,
  updateTask,
  deleteTask,
  completeTask,
};