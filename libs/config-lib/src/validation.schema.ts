import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .required()
    .default('development'),

  PORT: Joi.number().required(),
  MICROSERVICE_PORT: Joi.number().optional(),

  AUTH_SERVICE_BASEURL: Joi.string().required(),

  DATABASE_HOST: Joi.string().optional(),
  DATABASE_PORT: Joi.number().optional().default(5432),
  DATABASE_PASSWORD: Joi.string().optional(),
  DATABASE_USERNAME: Joi.string().optional(),
  DATABASE_NAME: Joi.string().optional(),
  DATABASE_SYNC: Joi.boolean()
    .optional()
    .default(process.env.NODE_ENV === 'development'),
  INTERNAL_API_SECRET: Joi.string().required(),
});
