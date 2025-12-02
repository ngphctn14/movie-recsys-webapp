import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  watchedAt: { type: Date, default: Date.now }
}, {collection: "histories"});

export default mongoose.model('History', historySchema);