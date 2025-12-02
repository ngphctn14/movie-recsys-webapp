import Joi from 'joi';

const createRatingDto = Joi.object({
  movieId: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required()
});

export default createRatingDto;