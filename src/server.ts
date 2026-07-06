import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import mongoose from 'mongoose';

import authRoutes from './routes/authRoutes';
import claimRoutes from './routes/claimRoutes';
import adminRoutes from './routes/adminRoutes';
import reviewerRoutes from './routes/reviewerRoutes';
import { uploadDir } from './utils/upload';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use('/uploads', express.static(uploadDir));
app.use('/api/auth', authRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviewer', reviewerRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

async function startServer() {
  if (!process.env.MONGO_URI) {
    console.warn('MONGO_URI is not set. Running without database connection.');
  } else {
    await mongoose.connect(process.env.MONGO_URI);
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error(error);
  process.exit(1);
});
