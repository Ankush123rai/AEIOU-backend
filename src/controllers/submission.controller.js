import Submission from '../models/submission.model.js';
import Task from '../models/task.model.js';
import Exam from '../models/exam.model.js';

export async function submitModule(req, res, next) {
  try {
    const { examId, module, responses } = req.body;

    
    if (!examId || !module) {
      return res.status(400).json({ 
        success: false,
        error: 'Exam ID and module are required' 
      });
    }
    
    const exam = await Exam.findOne({ _id: examId, isActive: true });
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: 'Active exam not found'
      });
    }
    
    let responsesArray = responses;
    if (typeof responses === 'string') {
      try {
        responsesArray = JSON.parse(responses);
      } catch (parseError) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid responses format' 
        });
      }
    }
    
    let totalScore = 0;
    const gradedResponses = await Promise.all(
      (responsesArray || []).map(async (response) => {
        const task = await Task.findById(response.taskId);
        if (!task) {
          return { 
            ...response, 
            score: 0, 
            feedback: 'Task not found',
            maxScore: 0
          };
        }
        
        let score = 0;
        let feedback = '';
        let maxScore = 5; 
        
        if (task.module !== 'speaking' && task.module !== 'writing') {
          const question = task.questions.find(q => 
            q._id.toString() === response.questionId
          );
          
          if (question) {
            maxScore = question.points || 5;
            
            if (question.correctAnswer) {
              if (String(response.answer).trim().toLowerCase() === 
                  String(question.correctAnswer).trim().toLowerCase()) {
                score = maxScore;
                feedback = 'Correct';
              } else {
                feedback = 'Incorrect';
              }
            } else {
              feedback = 'Pending manual review';
            }
          } else {
            feedback = 'Question not found';
          }
        } else {
          maxScore = task.points || 10;
          feedback = 'Pending manual review';
        }
        
        totalScore += score;
        return { 
          ...response, 
          score, 
          feedback,
          maxScore
        };
      })
    );

    const mediaUrls = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        mediaUrls.push(`/uploads/${file.filename}`);
      });
    }

    const submission = await Submission.create({
      studentId: req.user.sub,
      examId,
      module,
      responses: gradedResponses,
      mediaUrls,
      totalScore,
      status: (module === 'writing' || module === 'speaking') ? 'submitted' : 'evaluated'
    });

    const populatedSubmission = await Submission.findById(submission._id)
      .populate('studentId', 'name email')
      .populate('examId', 'title');

    res.status(201).json({
      success: true,
      message: 'Module submitted successfully',
      data: populatedSubmission
    });
  } catch (e) { 
    console.error('Error in submitModule:', e);
    next(e); 
  }
}

export async function reviewSubmission(req, res, next) {
  try {
    const { id } = req.params;
    const { feedbacks } = req.body;

    
    const submission = await Submission.findById(id)
      .populate('studentId', 'name email')
      .populate('examId', 'title');
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }
    
    let totalScore = 0;
    if (feedbacks && Array.isArray(feedbacks)) {
      submission.responses.forEach(response => {
        // Fix: Handle both undefined and null questionIds properly
        const feedback = feedbacks.find(fb => {
          // First check if taskId matches
          if (fb.taskId !== response.taskId.toString()) {
            return false;
          }
          
          // Then check questionId - handle both undefined and null cases
          const fbQuestionId = fb.questionId || null;
          const responseQuestionId = response.questionId || null;
          
          return fbQuestionId === responseQuestionId;
        });
        
        if (feedback) {
          if (typeof feedback.score === 'number') {
            // Use the maxScore from the response or default to a reasonable value
            const maxScore = response.maxScore || 10; // Default to 10 if not specified
            response.score = Math.min(feedback.score, maxScore);
          }
          if (feedback.feedback !== undefined) {
            response.feedback = feedback.feedback;
          }
        }
        totalScore += response.score || 0;
      });
    }
    
    submission.totalScore = totalScore;
    submission.status = 'evaluated';
    submission.reviewedBy = req.user.sub;
    submission.reviewedAt = new Date();
    
    await submission.save();
    
    res.json({
      success: true,
      message: 'Submission reviewed successfully',
      data: submission
    });
  } catch (e) { 
    next(e); 
  }
}

export async function mySubmissions(req, res, next) {
  try {
    const submissions = await Submission.find({ studentId: req.user.sub })
      .populate('examId', 'title modules')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({
      success: true,
      data: submissions,
      count: submissions.length
    });
  } catch (e) { 
    next(e); 
  }
}

export async function listByExam(req, res, next) {
  try {
    const { examId, module, status } = req.query;
    const query = {};
    
    if (examId) query.examId = examId;
    if (module) query.module = module;
    if (status) query.status = status;
    
    const submissions = await Submission.find(query)
      .populate('studentId', 'name email')
      .populate('examId', 'title')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({
      success: true,
      data: submissions,
      count: submissions.length
    });
  } catch (e) { 
    next(e); 
  }
}

export async function getSubmission(req, res, next) {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('examId', 'title modules')
      .populate('reviewedBy', 'name');
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }
    
    // Populate task details for each response
    const populatedResponses = await Promise.all(
      submission.responses.map(async (response) => {
        const task = await Task.findById(response.taskId);
        return {
          ...response.toObject(),
          task: task ? {
            title: task.title,
            instruction: task.instruction,
            module: task.module
          } : null
        };
      })
    );
    
    submission.responses = populatedResponses;
    
    res.json({
      success: true,
      data: submission
    });
  } catch (e) { 
    next(e); 
  }
}