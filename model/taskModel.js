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
    maxlength:5000,
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
    minlenght:1,
    maxlength:1000,
  },
  description: String,
  status: {
    type: String,
    enum: ["todo", "in-progress", "done"],
    default: "todo",
    maxlength: 5000,
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  dueDate: Date,
  comments: [commentSchema],
}, { timestamps: true });

export const Task = mongoose.model('Task', taskSchema);