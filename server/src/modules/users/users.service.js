import User from './users.schema.js';

export const getUserProfile = async (userId) => {
  return await User.findById(userId).select('-password');
};

// You can add updateProfile, changePassword, deleteUser here later