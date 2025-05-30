import express from 'express';
import authController from './controllers/auth.controller';
import passwordRouter from './controllers/password.controller';
import { corsErrorHandler, corsMiddleware } from './configs/cors.config';
import cors from 'cors';
import dataSource from './configs/orm.config';
import cookieParser from 'cookie-parser';
import config from './configs/config';
import verifyInternalReq from './middlewares/verify-internal-request';

const app = express();

// Initialize database connection
dataSource
  .initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });

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
