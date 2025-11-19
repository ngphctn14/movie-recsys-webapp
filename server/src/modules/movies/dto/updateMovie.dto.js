import Joi from 'joi';

const updateMovieDto = Joi.object({
  title: Joi.string().trim(),
  overview: Joi.string(),
  releaseDate: Joi.date().iso(),
  voteAverage: Joi.number().min(0).max(10),
  posterPath: Joi.string().uri()
}).min(1);

export default updateMovieDto;