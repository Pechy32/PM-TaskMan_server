import { getAllTasks } from '../../dao/taskDao.js';
import mongoose from 'mongoose';
const { Types } = mongoose;

// API handler for getting all tasks including filters and sorting
export async function getAllTasksService(req, res) {
  try {
    const filters = {};

    // --- isCompleted parameter ---
    if (req.query.isCompleted !== undefined) {
      if (req.query.isCompleted !== 'true' && req.query.isCompleted !== 'false') {
        return res.status(400).json({ message: "Invalid value for isCompleted. Use 'true' or 'false'." });
      }
      filters.isCompleted = req.query.isCompleted === 'true';
    }

    // --- priority parameter ---
    const validPriorities = ['Low', 'Medium', 'High'];
    if (req.query.priority) {
      if (!validPriorities.includes(req.query.priority)) {
        return res.status(400).json({ message: "Invalid priority. Use 'Low', 'Medium', or 'High'." });
      }
      filters.priority = req.query.priority;
    }

    // --- dueBefore / dueAfter parameters ---
    if (req.query.dueBefore && isNaN(Date.parse(req.query.dueBefore))) {
      return res.status(400).json({ message: "Invalid date format for dueBefore." });
    }
    if (req.query.dueAfter && isNaN(Date.parse(req.query.dueAfter))) {
      return res.status(400).json({ message: "Invalid date format for dueAfter." });
    }
    if (req.query.dueBefore) {
      filters.dueDate = filters.dueDate || {};
      filters.dueDate.$lte = new Date(req.query.dueBefore);
    }
    if (req.query.dueAfter) {
      filters.dueDate = filters.dueDate || {};
      filters.dueDate.$gte = new Date(req.query.dueAfter);
    }

    // --- boardId parameter ---
    if (req.query.boardId) {
      if (!Types.ObjectId.isValid(req.query.boardId)) {
        return res.status(400).json({ message: "Invalid boardId. Must be a valid MongoDB ObjectId." });
      }
      filters.board = new Types.ObjectId(req.query.boardId);
    }

     // --- parentTaskId parameter ---
    if (req.query.parentTaskId) {
      if (req.query.parentTaskId === 'null') {
        filters.parentTaskId = null;
      } else if (!Types.ObjectId.isValid(req.query.parentTaskId)) {
        return res.status(400).json({ message: "Invalid parentTaskId. Must be a valid MongoDB ObjectId or 'null'." });
      } else {
        filters.parentTaskId = new Types.ObjectId(req.query.parentTaskId);
      }
    }

    // --- Sorting parameters ---
    const options = {
      limit: parseInt(req.query.limit) || 0,
      skip: ((parseInt(req.query.page) || 1) - 1) * (parseInt(req.query.limit) || 0),
      sort: req.query.sort
        ? req.query.sort.split(',').map(part => {
            const [field, order = 'asc'] = part.split(':');
            const validOrders = ['asc', 'desc'];
            if (!validOrders.includes(order.toLowerCase())) {
              throw new Error(`Invalid sort order for field '${field}': use 'asc' or 'desc'`);
            }
            return { field, order: order.toLowerCase() };
          })
        : [],
    };

    const tasks = await getAllTasks(filters, options);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}