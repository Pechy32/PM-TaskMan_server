import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  created: { type: Date, default: Date.now },
  priority: { type: String, enum: ['Low', 'Medium', 'High'] },
  isCompleted: { type: Boolean, default: false },
  parentTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  notes: [{ timestamp: { type: Date, default: Date.now }, note: { type: String, required: true } }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }
});

export const Task = mongoose.model('Task', taskSchema);