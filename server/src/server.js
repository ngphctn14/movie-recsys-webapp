import dotenv from 'dotenv';
import http from 'http';
import createApp from './app.js';
import connectDb from './config/database.js';

dotenv.config();

const startServer = async () => {
  // 1. Connect to Database
  await connectDb();

  // 2. Create Express App
  const app = createApp();
  const server = http.createServer(app);
  const PORT = process.env.PORT || 5000;

  // 3. Start Listening
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();