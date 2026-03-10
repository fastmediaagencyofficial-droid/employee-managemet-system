import express from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    updateTaskStatus,
    deleteTask,
    getMyTasks,
    getTeamTasks,
    getTaskStatistics,
    addTaskComment,
} from '../controllers/taskController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Task CRUD routes
router.post('/', createTask);                      // Create task (Manager/Admin)
router.get('/', getTasks);                         // Get all tasks (role-filtered)
router.get('/my-tasks', getMyTasks);               // Get current user's tasks
router.get('/team-tasks', getTeamTasks);           // Get team tasks (Manager)
router.get('/statistics', getTaskStatistics);      // Get task statistics
router.get('/:id', getTaskById);                   // Get task by ID
router.put('/:id', updateTask);                    // Update task (Manager/Admin)
router.patch('/:id/status', updateTaskStatus);     // Update task status
router.delete('/:id', deleteTask);                 // Delete task (Manager/Admin)

// Task comments
router.post('/:id/comments', addTaskComment);      // Add comment to task

export default router;
