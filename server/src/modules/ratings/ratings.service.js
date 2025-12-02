import Rating from './ratings.schema.js';
import Movie from '../movies/movies.schema.js';

// Helper to recalculate average
const updateMovieAverage = async (movieId) => {
  const stats = await Rating.aggregate([
    { $match: { movieId: movieId } },
    { $group: { _id: '$movieId', averageRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);

  if (stats.length > 0) {
    await Movie.findByIdAndUpdate(movieId, {
      voteAverage: Math.round(stats[0].averageRating * 10) / 10, // Round to 1 decimal
      voteCount: stats[0].count
    });
  }
};

export const addRating = async (userId, { movieId, rating }) => {
  // Upsert: Update if exists, Create if not
  const savedRating = await Rating.findOneAndUpdate(
    { userId, movieId },
    { rating },
    { new: true, upsert: true }
  );

  // Recalculate average for the movie
  await updateMovieAverage(savedRating.movieId);
  
  return savedRating;
};

export const getUserRatings = async (userId) => {
  return await Rating.find({ userId }).populate('movieId', 'title posterPath');
};