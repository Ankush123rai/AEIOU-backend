import Exam from '../models/exam.model.js';
import Task from '../models/task.model.js';

export async function createExam(req, res, next) {
  try {
    const exam = await Exam.create({ ...req.body, createdBy: req.user.sub });
    res.status(201).json(exam);
  } catch (e) { next(e); }
}

export async function createTask(req, res, next) {
  try {
    const task = await Task.create({ ...req.body, createdBy: req.user.sub });

    const populatedTask = await Task.findById(task._id)
      .populate('createdBy', 'name');
    
    res.status(201).json(populatedTask);
  } catch (e) { next(e); }
}



export async function listTasks(req, res, next) {
  try {
    const { module } = req.query;
    const q = { isActive: true };
    if (module) q.module = module;
    
    const tasks = await Task.find(q)
      .populate('createdBy', 'name') 
      .limit(500);
    
    console.log("tasks", tasks);
    res.json(tasks);
  } catch (e) { next(e); }
}


export async function activeListExams(req, res, next) {
  try {
    const exams = await Exam.findOne({ isActive: true })
      .populate({
        path: 'modules.taskIds',
        select: '-correctAnswer'
      })
      .populate('createdBy', 'name'); 
    
    res.json(exams);
  } catch (e) { next(e); }
}

export async function listExams(req, res, next) { 
  try {
    const exams = await Exam.find({ isActive: true })
      .populate({
        path: 'modules.taskIds',
        select: '-correctAnswer'
      })
      .populate('createdBy', 'name'); 
    
    res.json(exams);
  } catch (e) { next(e); }
}


export async function getExam(req, res, next) {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('modules.taskIds')
      .populate('createdBy', 'name'); 
    
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    res.json(exam);
  } catch (e) { next(e); }
}
