import Joi from 'joi';

const createWatchlistDto = Joi.object({
  movieId: Joi.string().required()
});

export default createWatchlistDto;