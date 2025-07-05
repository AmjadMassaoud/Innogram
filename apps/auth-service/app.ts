import express from 'express';
import authController from './controllers/auth.controller';
import passwordController from './controllers/password.controller';
import { corsErrorHandler } from './configs/cors.config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import config from './configs/config';
import verifyInternalReq from './middlewares/verify-internal-request.middleware';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';
import { catchErrors } from './middlewares/catch-errors.middleware';

const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(
  cors({
    origin: config.cors.cors_origin,
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-internal-api-secret'],
    preflightContinue: false,
  }),
);

app.use(corsErrorHandler);
app.use(verifyInternalReq);

app.use('/innogram/v1/auth', authController);
app.use('/innogram/v1/passwords', passwordController);

app.use(catchErrors);

export default app;
