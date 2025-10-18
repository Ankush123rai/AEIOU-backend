import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  module: { type: String, enum: ['listening','speaking','reading','writing'], required: true, index: true },
  type: { type: String, enum: ['multiple-choice','text','audio','video','upload',"text-or-upload"], required: true },
  question: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: String },
  mediaUrl: { type: String },
  points: { type: Number, default: 5 },
  difficulty: { type: String, enum: ['easy','medium','hard'], default: 'medium' },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

export default mongoose.model('Task', taskSchema);
