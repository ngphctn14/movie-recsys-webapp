import * as watchlistService from './watchlists.service.js';
import createWatchlistDto from './dto/createWatchlist.dto.js';

export const add = async (req, res) => {
  try {
    const { error, value } = createWatchlistDto.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const item = await watchlistService.addToWatchlist(req.user._id, value.movieId);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    await watchlistService.removeFromWatchlist(req.user._id, req.params.movieId);
    res.json({ message: 'Removed from watchlist' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const items = await watchlistService.getUserWatchlist(req.user._id);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};