const express = require('express');
const router = express.Router();
const Form = require('../models/Form');

router.get('/', async (req, res) => {
  try {
    const forms = await Form.find().select('title description createdAt fields').sort({ createdAt: -1 });
    const publicForms = forms
      .filter(form => form.fields?.length > 0)
      .map(({ _id, title, description, createdAt }) => ({ _id, title, description, createdAt }));
    res.json(publicForms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ error: 'Form not found' });

    res.json({
      _id: form._id,
      title: form.title,
      description: form.description,
      fields: form.fields.sort((a, b) => a.order - b.order)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

