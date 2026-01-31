import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlenght:1,
    maxlenght:1000,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },

  passwordHash: {
    type: String,
    required: false,
  },

  googleId: {
    type: String,
    unique: true,
    sparse: true, 
  },

  isAdmin: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });


export const User = mongoose.model('User', userSchema);