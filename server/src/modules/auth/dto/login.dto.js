import Joi from 'joi';

const loginDto = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export default loginDto;