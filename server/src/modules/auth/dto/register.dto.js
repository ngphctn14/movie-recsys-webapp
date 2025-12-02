import Joi from 'joi';

const registerDto = Joi.object({
  fullName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  favoriteGenres: Joi.array().items(Joi.number())
});

export default registerDto;