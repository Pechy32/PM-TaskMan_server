import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors'; 
import taskController from './controller/taskController.js';
import userController from './controller/userController.js';
import projectController from './controller/projectController.js'

// Create Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(cors()); // allows all origins by default

// Database connection
mongoose.connect('mongodb://localhost:27017/task-user', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Controllers
app.use('/tasks', taskController);
app.use('/users', userController);
app.use('/projects', projectController);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});