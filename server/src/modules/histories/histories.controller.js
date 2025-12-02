import * as historyService from './histories.service.js';
import createHistoryDto from './dto/createHistory.dto.js';

// Add to history (or update timestamp if already watched)
export const add = async (req, res) => {
  try {
    const { error, value } = createHistoryDto.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    // The service handles "upsert" (update time if exists, create if not)
    const item = await historyService.addToHistory(req.user._id, value.movieId);
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's watch history (Recently watched first)
export const getAll = async (req, res) => {
  try {
    const items = await historyService.getUserHistory(req.user._id);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Optional: Clear a specific movie from history
// Note: You might need to add a delete function in histories.service.js if not already there
export const remove = async (req, res) => {
  try {
    // Assuming you add a delete function in service similarly to watchlist
    // await historyService.removeFromHistory(req.user._id, req.params.movieId);
    res.status(501).json({ message: 'Not implemented yet' }); 
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};