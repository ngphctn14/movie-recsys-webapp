import Joi from 'joi';

const createMovieDto = Joi.object({
  title: Joi.string().required().trim(),
  overview: Joi.string().required(),
  releaseDate: Joi.date().iso(),
  genres: Joi.array().items(
    Joi.object({
      id: Joi.number(),
      name: Joi.string()
    })
  ),
  voteAverage: Joi.number().min(0).max(10),
  posterPath: Joi.string().uri().optional(),
  tmdbId: Joi.number().integer()
});

export default createMovieDto;