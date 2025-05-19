import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .required()
    .default('development'),

  // PORT: Joi.number().optional(),
  MICROSERVICE_PORT: Joi.number().optional(),

  DATABASE_HOST: Joi.string().optional(),
  DATABASE_PORT: Joi.number().optional().default(5432),
  DATABASE_PASSWORD: Joi.string().optional(),
  DATABASE_USERNAME: Joi.string().optional(),
  DATABASE_NAME: Joi.string().optional(),
  DATABASE_SYNC: Joi.boolean()
    .optional()
    .default(process.env.NODE_ENV === 'development'),

  // // JWT (if used by NestJS services for validating tokens issued by auth-service)
  // JWT_SECRET: Joi.string().when('NODE_ENV', {
  //   is: 'production',
  //   then: Joi.required(),
  //   otherwise: Joi.optional().default('your-development-secret'), // Default for dev
  // }),
  // JWT_EXPIRES_IN: Joi.string().default('1h'),

  // // Redis
  // REDIS_HOST: Joi.string().default('localhost'),
  // REDIS_PORT: Joi.number().default(6379),
});
