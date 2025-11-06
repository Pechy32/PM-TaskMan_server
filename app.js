import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors'; 

import taskController from './controller/taskController.js';
import userController from './controller/userController.js';
import projectController from './controller/projectController.js';
import authController from './controller/authController.js';

import logger from './middleware/logger.js'
import authMiddleware from './middleware/auth.js'

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

// Middlewares
app.use(logger);
app.use(authMiddleware);

// Controllers
app.use('/api/tasks', taskController);
app.use('/api/users', userController);
app.use('/api/projects', projectController);
app.use('/api/auth', authController);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});