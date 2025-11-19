import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import routesV1 from './routes/v1.js';

const createApp = () => {
  const app = express();

  app.use(helmet());

  app.use(
    cors({
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    })
  );

  app.use(morgan("dev"));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api/v1", routesV1);

  // 3. Global Error Handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
  });

  return app;
};

export default createApp;
