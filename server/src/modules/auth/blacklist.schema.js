import mongoose from 'mongoose';

const blacklistSchema = new mongoose.Schema({
  token: { 
    type: String, 
    required: true, 
    index: true 
  },
  expiresAt: { 
    type: Date, 
    required: true 
  }
}, { timestamps: true });

blacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Blacklist', blacklistSchema);