import Submission from '../models/submission.model.js';
import Task from '../models/task.model.js';


export async function submitModule(req, res, next) {
  try {
    const { examId, module, responses } = req.body;
    console.log("first", req.body);
    
    if (!examId || !module) return res.status(400).json({ error: 'examId and module required' });
    
    // Parse responses if it's a string
    let responsesArray = responses;
    if (typeof responses === 'string') {
      try {
        responsesArray = JSON.parse(responses);
      } catch (parseError) {
        return res.status(400).json({ error: 'Invalid responses format' });
      }
    }
    
    let total = 0;
    const graded = await Promise.all((responsesArray || []).map(async r => {
      const task = await Task.findById(r.taskId);
      if (!task) return { ...r, score: 0 };
      let score = 0;
      if (task.module !== 'speaking' && task.module !== 'writing' && task.correctAnswer) {
        if (String(r.answer).trim() === String(task.correctAnswer).trim()) score = task.points || 0;
      }
      total += score;
      return { ...r, score };
    }));

    const mediaUrls = [];
    if (req.files) {
      for (const f of req.files) mediaUrls.push(`/uploads/${f.filename}`);
    }

    const sub = await Submission.create({
      studentId: req.user.sub,
      examId, 
      module, 
      responses: graded, 
      mediaUrls, 
      totalScore: total
    });
    res.status(201).json(sub);
  } catch (e) { 
    next(e); 
  }
}

export async function reviewSubmission(req, res, next) {
  try {
    const { id } = req.params;
    const { feedbacks } = req.body; 
    const sub = await Submission.findById(id);
    if (!sub) return res.status(404).json({ error: 'Submission not found' });
    for (const fb of feedbacks || []) {
      const r = sub.responses.find(x => String(x.taskId) === String(fb.taskId));
      if (r) {
        if (typeof fb.score === 'number') r.score = fb.score;
        if (fb.feedback) r.feedback = fb.feedback;
      }
    }
    sub.totalScore = sub.responses.reduce((a, b) => a + (b.score || 0), 0);
    sub.status = 'evaluated';
    sub.reviewedBy = req.user.sub;
    await sub.save();
    res.json(sub);
  } catch (e) { next(e); }
}

export async function mySubmissions(req, res, next) {
  try {
    const list = await Submission.find({ studentId: req.user.sub }).sort({ createdAt: -1 }).limit(100);
    res.json(list);
  } catch (e) { next(e); }
}

export async function listByExam(req, res, next) {
  try {
    const { examId, module } = req.query;
    const q = {};
    if (examId) q.examId = examId;
    if (module) q.module = module;
    const list = await Submission.find(q).sort({ createdAt: -1 }).limit(500);
    res.json(list);
  } catch (e) { next(e); }
}
