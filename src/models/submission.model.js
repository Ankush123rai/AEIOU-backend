import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  answer: { type: mongoose.Schema.Types.Mixed },
  score: { type: Number, default: 0 },
  feedback: { type: String }
}, { _id: false });

const submissionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true, index: true },
  module: { type: String, enum: ['listening','speaking','reading','writing'], required: true },
  responses: [responseSchema],
  mediaUrls: [{ type: String }], 
  totalScore: { type: Number, default: 0 },
  status: { type: String, enum: ['submitted','evaluated'], default: 'submitted', index: true },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

export default mongoose.model('Submission', submissionSchema);
