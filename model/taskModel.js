import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
}, { _id: true });

const taskSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  parentTaskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    default: null,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: String,
  status: {
    type: String,
    enum: ["todo", "in-progress", "done", "archived"],
    default: "todo",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "low",
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  dueDate: Date,
  comments: [commentSchema],
}, { timestamps: true });

export const Task = mongoose.model('Task', taskSchema);