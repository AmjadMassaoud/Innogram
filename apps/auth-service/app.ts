import express from 'express';
import authController from './controllers/auth.controller';
import passwordRouter from './controllers/password.controller';
import { corsErrorHandler } from './configs/cors.config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import config from './configs/config';
import verifyInternalReq from './middlewares/verify-internal-request';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';

const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(
  cors({
    origin: !config.cors.cors_origin,
    methods: ['GET', 'POST'],
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
  }),
);

app.use(corsErrorHandler);
app.use(verifyInternalReq);

app.use(express.json());

app.use('/innogram/auth', authController);
app.use('/innogram/password', passwordRouter);

export default app;
