import * as userService from './users.service.js';

export const getProfile = async (req, res) => {
  try {
    // req.user is set by the passport middleware
    const user = await userService.getUserProfile(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};