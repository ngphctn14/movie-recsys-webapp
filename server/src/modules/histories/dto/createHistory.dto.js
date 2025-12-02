import Joi from 'joi';

const createHistoryDto = Joi.object({
  movieId: Joi.string().required()
});

export default createHistoryDto;