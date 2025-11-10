import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors'; 

import taskController from './controller/taskController.js';
import userController from './controller/userController.js';
import projectController from './controller/projectController.js';
import authController from './controller/authController.js';

import logger from './middleware/logger.js'
import authMiddleware from './middleware/auth.js'
import { validateProject, validateProjectId } from './middleware/projectIdValidator.js';

// Create Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(cors()); // allows all origins by default

// Database connection
mongoose.connect('mongodb://localhost:27017/taskmandb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Middlewares (depends on order of declaration!)
app.use(logger);

// Controllers
app.use('/api/auth', authMiddleware, authController);
app.use('/api/users', authMiddleware, userController);
// app.use('/api/projects', authMiddleware, projectController);
app.use('/api/:projectId/tasks', validateProject, authMiddleware, taskController);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});