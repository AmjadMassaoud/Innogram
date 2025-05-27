import express from 'express';
import authController from './controllers/auth.controller';
import passwordRouter from './controllers/password.controller';
import corsConfig from './configs/cors.config';
import cors from 'cors';
import dataSource from './configs/orm.config';
import cookieParser from 'cookie-parser';

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
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

app.use(cors(corsConfig));

app.use(express.json());

app.get('/innogram/test', (_, res) => {
  res.json({ message: 'hello' });
});

app.use('/innogram/auth', authController);
app.use('/innogram/password', passwordRouter);

export default app;
