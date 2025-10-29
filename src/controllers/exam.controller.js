import Exam from '../models/exam.model.js';
import Task from '../models/task.model.js';

export async function createExam(req, res, next) {
  try {
    const { title, level, modules, totalMarks } = req.body;
    
    const exam = await Exam.create({ 
      title, 
      level, 
      modules, 
      totalMarks,
      createdBy: req.user.sub 
    });
    
    res.status(201).json({
      success: true,
      message: 'Exam created successfully',
      data: exam
    });
  } catch (e) { 
    next(e); 
  }
}

export async function createTask(req, res, next) {
  try {
    const taskData = {
      ...req.body,
      createdBy: req.user.sub
    };

    // Validate task structure based on module
    if (taskData.module === 'listening' && !taskData.mediaUrl) {
      return res.status(400).json({
        success: false,
        message: 'Listening tasks require a media URL'
      });
    }

    if (taskData.module === 'speaking' && taskData.taskType === 'video_response' && !taskData.instruction) {
      return res.status(400).json({
        success: false,
        message: 'Speaking tasks require clear instructions'
      });
    }

    const task = await Task.create(taskData);
    
    const populatedTask = await Task.findById(task._id)
      .populate('createdBy', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: populatedTask
    });
  } catch (e) { 
    next(e); 
  }
}


export async function listTasks(req, res, next) {
  try {
    const { module, taskType, isActive = true } = req.query;
    const query = { isActive: isActive !== 'false' };
    
    if (module) query.module = module;
    if (taskType) query.taskType = taskType;
    
    const tasks = await Task.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({
      success: true,
      data: tasks,
      count: tasks.length
    });
  } catch (e) { 
    next(e); 
  }
}

export async function getTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      data: task
    });
  } catch (e) { 
    next(e); 
  }
}

export async function updateTask(req, res, next) {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (e) { 
    next(e); 
  }
}

export async function deleteTask(req, res, next) {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (e) { 
    next(e); 
  }
}

export async function activeListExams(req, res, next) {
  try {
    const exams = await Exam.findOne({ isActive: true })
      .populate({
        path: 'modules.taskIds',
        match: { isActive: true },
        select: '-correctAnswer'
      })
      .populate('createdBy', 'name email');
      
    
    if (!exams) {
      return res.status(404).json({
        success: false,
        message: 'No active exam found'
      });
    }
    res.json({
      success: true,
      data: exams
    });
  } catch (e) { 
    next(e); 
  }
}

export async function listExams(req, res, next) {
  try {
    const exams = await Exam.find({ isActive: true })
      .populate({
        path: 'modules.taskIds',
        match: { isActive: true }
      })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: exams,
      count: exams.length
    });
  } catch (e) { 
    next(e); 
  }
}

export async function getExam(req, res, next) {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate({
        path: 'modules.taskIds',
        match: { isActive: true }
      })
      .populate('createdBy', 'name email');
    
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }
    
    res.json({
      success: true,
      data: exam
    });
  } catch (e) { 
    next(e); 
  }
}

export async function updateExam(req, res, next) {
  try {
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');
    
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Exam updated successfully',
      data: exam
    });
  } catch (e) { 
    next(e); 
  }
}