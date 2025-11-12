const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const { authenticateAdmin } = require('../middleware/auth');
const { validateSubmission, sanitizeInput } = require('../middleware/validation');

router.post('/', sanitizeInput, validateSubmission, async (req, res) => {
  try {
    const { formId, answers } = req.body;
    const Form = require('../models/Form');
    const form = await Form.findById(formId);
    if (!form) return res.status(404).json({ error: 'Form not found' });

    const submission = new Submission({
      formId,
      formVersion: form.version || 1,
      formSnapshot: {
        title: form.title,
        description: form.description,
        fields: form.fields.map(({ label, type, name, required, options }) => ({ label, type, name, required, options }))
      },
      answers: new Map(Object.entries(answers)),
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    });

    await submission.save();
    res.status(201).json({ message: 'Form submitted successfully', submissionId: submission._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/form/:formId', authenticateAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    const query = { formId: req.params.formId };
    if (startDate || endDate) {
      query.submittedAt = {};
      if (startDate) query.submittedAt.$gte = startDate;
      if (endDate) query.submittedAt.$lte = endDate;
    }

    const total = await Submission.countDocuments(query);
    const submissions = await Submission.find(query)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('formId', 'title');
    
    const formattedSubmissions = submissions.map(sub => ({
      ...sub.toObject(),
      answers: sub.answers instanceof Map ? Object.fromEntries(sub.answers) : sub.answers
    }));
    
    res.json({
      submissions: formattedSubmissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const formId = req.query.formId || null;
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    const query = {};
    if (formId) query.formId = formId;
    if (startDate || endDate) {
      query.submittedAt = {};
      if (startDate) query.submittedAt.$gte = startDate;
      if (endDate) query.submittedAt.$lte = endDate;
    }

    const total = await Submission.countDocuments(query);
    const submissions = await Submission.find(query)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('formId', 'title description');
    
    const formattedSubmissions = submissions.map(sub => ({
      ...sub.toObject(),
      answers: sub.answers instanceof Map ? Object.fromEntries(sub.answers) : sub.answers
    }));
    
    res.json({
      submissions: formattedSubmissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('formId');
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    const formattedSubmission = {
      ...submission.toObject(),
      answers: submission.answers instanceof Map ? Object.fromEntries(submission.answers) : submission.answers,
      form: submission.formSnapshot || submission.formId
    };
    res.json(formattedSubmission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

