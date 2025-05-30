import app from './app';
import config from './configs/config';
import dataSource from './configs/orm.config';

const PORT = config.server.port || 4500;

const startServer = async () => {
  try {
    // Ensure database is initialized
    await dataSource.initialize();
    console.log('Database connection initialized');

    app.listen(PORT, () => {
      console.log(`Auth service is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();
