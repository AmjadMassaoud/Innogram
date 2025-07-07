import swaggerJSDoc from 'swagger-jsdoc';

import config from './configs/config';

const port = config.server.port || 4500;

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Auth Service API',
    version: '1.0.0',
    description:
      'Authentication microservice for Innogram application, handling user authentication, authorization, token management, and OAuth integration.',
  },
  servers: [
    {
      url: `http://localhost:${port}`,
      description: 'Development server',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./controllers/**/*.ts', './app.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
