import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  id: { type: String, required: true }, 
  text: { type: String, required: true }
}, { _id: false });

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [optionSchema],
  correctAnswer: { type: String }, // For auto-grading
  points: { type: Number, default: 5 },
  questionType: { 
    type: String, 
    enum: ['multiple_choice', 'text_input', 'file_upload'],
    default: 'multiple_choice'
  }
}, { _id: true }); 

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  module: { 
    type: String, 
    enum: ['listening', 'speaking', 'reading', 'writing'], 
    required: true 
  },
  taskType: { 
    type: String, 
    enum: [
      'multiple_choice',
      'written_response', 
      'audio_response',
      'video_response',
      'file_upload'
    ],
    required: true 
  },
  
  instruction: { type: String, required: true },
  content: { type: String }, 
  questions: [questionSchema],
  
  mediaUrl: { type: String }, 
  imageUrl: { type: String }, 
  
  durationMinutes: { type: Number, default: 10 },
  points: { type: Number, default: 10 }, 
  maxFiles: { type: Number, default: 1 },
  maxFileSize: { type: Number, default: 100 }, 
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

taskSchema.index({ module: 1, isActive: 1 });
taskSchema.index({ createdBy: 1 });

export default mongoose.model('Task', taskSchema);