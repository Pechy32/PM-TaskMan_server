import { User } from '../model/userModel.js';

export const createUser = async (data) => {
  const user = new User(data);
  return await user.save();
};

export const getAllUsers = async () => {
  return await User.find();
};

export const getUser = async (id) => {
  return await User.findById(id);
};

export const getUserByEmail = async (email) => {
  return await User.findOne({ email });
};

export const updateUser = async (id, data) => {
  return await User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

export const deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};