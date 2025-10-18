import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import app from './app.js';

const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.set('strictQuery', true);
mongoose.connect(MONGODB_URI).then(() => {
  console.log('✅ MongoDB connected');
  app.listen(PORT, () => console.log(`🚀 API listening on http://localhost:${PORT}`));
}).catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});
