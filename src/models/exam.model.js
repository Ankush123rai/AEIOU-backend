import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  name: { type: String, enum: ['listening','speaking','reading','writing'], required: true },
  durationMinutes: { type: Number, default: 60 },
  bufferMinutes: { type: Number, default: 10 },
  taskIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }]
}, { _id: false });

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  level: { type: String, enum: ['basic','advanced'], default: 'advanced' },
  modules: [moduleSchema],
  totalMarks: { type: Number, default: 100 },
  isActive: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

export default mongoose.model('Exam', examSchema);
