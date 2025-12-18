import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import alertsRouter from './routes/alerts.js';
import incidentsRouter from './routes/incidents.js';
import hospitalsRouter from './routes/hospitals.js';
import ngosRouter from './routes/ngos.js';
import sosRouter from './routes/sos.js';
import rssRouter from './routes/rss.js';
import chatbotRouter from './routes/chatbot.js';
import { initRSSCronJobs } from './services/cronService.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/idmrs';
mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('MongoDB connected');
    // Initialize RSS feed fetching after database connection
    initRSSCronJobs();
  })
  .catch((err) => console.error('MongoDB connection error:', err));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/alerts', alertsRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/hospitals', hospitalsRouter);
app.use('/api/ngos', ngosRouter);
app.use('/api/sos', sosRouter);
app.use('/api/rss', rssRouter);
app.use('/api/chatbot', chatbotRouter);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));


