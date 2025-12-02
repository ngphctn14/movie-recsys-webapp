import History from './histories.schema.js';

export const addToHistory = async (userId, movieId) => {
  // Upsert to update the "watchedAt" time if already watched
  return await History.findOneAndUpdate(
    { userId, movieId },
    { watchedAt: new Date() },
    { new: true, upsert: true }
  );
};

export const getUserHistory = async (userId) => {
  return await History.find({ userId })
    .populate('movieId', 'title posterPath')
    .sort({ watchedAt: -1 });
};