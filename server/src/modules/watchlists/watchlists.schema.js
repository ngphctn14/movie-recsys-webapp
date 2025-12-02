import mongoose from "mongoose";

const watchlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    addedAt: { type: Date, default: Date.now },
  },
  { collection: "watchlists", timestamps: true }
);

watchlistSchema.index({ userId: 1, movieId: 1 }, { unique: true });

export default mongoose.model("Watchlist", watchlistSchema);
