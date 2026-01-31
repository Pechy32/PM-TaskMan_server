import mongoose from "mongoose";

const projectMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  role: {
    type: String,
    enum: ["editor", "viewer"],
    default: "viewer",
  }
}, { _id: false });

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 1000,
  },
  description: {
    type: String,
    maxlength: 5000,
  },

  status: {
    type: String,
    enum: ["active", "on-hold", "done"],
    default: "active", 
  },

  dueDate: {
    type: Date,
  },

  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  members: [projectMemberSchema],

}, { timestamps: true });

export const Project = mongoose.model("Project", projectSchema);