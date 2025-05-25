import express from 'express';

const app = express();

app.use('innogram/auth', authController);
app.use('innogram/auth', passwordController);
