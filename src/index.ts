import express, { Express, Request, Response } from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import quizeRoute from './routes/quiz'
import authRoute from './routes/auth'
import * as settings from "./settings"
import { clientInfo } from './middlewares/middlewares'
import path from 'path'




dotenv.config()
const app: Express = express()

const SERVER_PORT = process.env.SERVER_PORT || 8000

app.use("/upload", express.static(path.join(process.cwd(), "upload")));

app.use(express.json())
app.use(cookieParser(settings.COOKIE_SECRET))

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(clientInfo)
app.use('/api/quiz', quizeRoute)
app.use('/api/auth', authRoute)


async function start() {
  try {
    await mongoose.connect(settings.MONGO_DB_URL).then(() => console.log('Mongoose подключен к базе данных.'))
    const server = app.listen(SERVER_PORT, () => {
      console.log(`Server is running on port ${SERVER_PORT}`);

    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('Shutting down server...');
      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('Interrupt signal received. Closing server...');
      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
    });
  } catch (error) {
    console.log(error);
  }
}

start()