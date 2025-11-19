import Movie from './movies.schema.js';

export const createMovie = async (movieData) => {
  const movie = new Movie(movieData);
  return await movie.save();
};

export const getAllMovies = async (limit = 20, page = 1) => {
  const skip = (page - 1) * limit;
  return await Movie.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

export const getMovieById = async (id) => {
  return await Movie.findById(id);
};

export const updateMovie = async (id, updateData) => {
  return await Movie.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteMovie = async (id) => {
  return await Movie.findByIdAndDelete(id);
};