import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  overview: {
    type: String,
    required: true,
  },
  releaseDate: {
    type: Date,
  },
  genres: [{
    id: Number,
    name: String
  }],
  voteAverage: {
    type: Number,
    default: 0
  },
  posterPath: String,
  tmdbId: {
    type: Number,
    unique: true,
    sparse: true 
  }
}, {
  timestamps: true,
  collection: 'movies'
});

export default mongoose.model('Movie', movieSchema);