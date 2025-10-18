import User from '../models/user.model.js';
import Submission from '../models/submission.model.js';
import mongoose from 'mongoose';

export async function createTeacher(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email, password required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email already exists' });
    const user = new User({ name, email, role: 'teacher' });
    await user.setPassword(password);
    await user.save();
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (e) { next(e); }
}

export async function dashboardStats(req, res, next) {
  try {
    const [totalStudents, totalTeachers, totalSubmissions] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      Submission.countDocuments()
    ]);
    res.json({ totalStudents, totalTeachers, totalSubmissions });
  } catch (e) { next(e); }
}

export async function listUsers(req, res, next) {
  try {
    const users = await User.find().select('-password').limit(2000);
    const usersWithProgress = await Promise.all(
      users.map(async (user) => {
        if (user.role === 'student') {
          const Submission = mongoose.model('Submission');
          const modules = ['listening', 'speaking', 'reading', 'writing'];
          
          const progress = {};
          
          for (const module of modules) {
            const latestSubmission = await Submission.findOne({
              studentId: user._id,
              module: module
            }).sort({ createdAt: -1 });
            
            if (latestSubmission) {
              progress[module] = latestSubmission.status; 
            } else {
              progress[module] = 'not_started'; 
            }
          }
          
          return {
            ...user.toObject(),
            progress
          };
        } else {
          return user.toObject();
        }
      })
    );
    
    res.json(usersWithProgress);
  } catch (e) { 
    next(e); 
  }
}
