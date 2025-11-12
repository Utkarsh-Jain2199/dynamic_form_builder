const express = require('express');
const router = express.Router();
const Form = require('../models/Form');
const { authenticateAdmin } = require('../middleware/auth');
const { sanitizeInput } = require('../middleware/validation');

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin-secret-token-change-this';

  if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Invalid credentials' });
  
  res.json({ token: ADMIN_TOKEN });
});

router.use(authenticateAdmin);
router.use(sanitizeInput);

router.get('/forms', async (req, res) => {
  try {
    const forms = await Form.find().sort({ createdAt: -1 });
    res.json(forms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/forms/:id', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json(form);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/forms', async (req, res) => {
  try {
    const { title, description, fields = [] } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const form = new Form({ title, description: description || '', fields });
    if (form.fields.length > 0 && !form.validateFieldNames()) {
      return res.status(400).json({ error: 'Field names must be unique within a form' });
    }

    await form.save();
    res.status(201).json(form);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/forms/:id', async (req, res) => {
  try {
    const { title, description, fields, requireFields } = req.body;

    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    if (requireFields && (!form.fields || form.fields.length === 0)) {
      return res.status(400).json({ error: 'Form must have at least one field' });
    }

    if (title !== undefined) form.title = title;
    if (description !== undefined) form.description = description;
    if (fields !== undefined) {
      form.fields = fields;
      if (form.fields.length > 0 && !form.validateFieldNames()) {
        return res.status(400).json({ error: 'Field names must be unique within a form' });
      }
    }

    await form.save();
    res.json(form);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/forms/:id', async (req, res) => {
  try {
    const form = await Form.findByIdAndDelete(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/forms/:id/fields', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ error: 'Form not found' });

    const { label, type, name, required, options, validation, order } = req.body;
    if (!label || !type || !name) return res.status(400).json({ error: 'Label, type, and name are required' });
    if (form.fields.some(f => f.name === name)) return res.status(400).json({ error: 'Field name must be unique within the form' });

    form.fields.push({
      label, type, name,
      required: required || false,
      options: options || [],
      validation: validation || {},
      order: order !== undefined ? order : form.fields.length
    });

    await form.save();
    res.status(201).json(form);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/forms/:id/fields/:fieldId', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const field = form.fields.id(req.params.fieldId);
    if (!field) {
      return res.status(404).json({ error: 'Field not found' });
    }

    const { label, type, name, required, options, validation, order } = req.body;

    if (name && name !== field.name && form.fields.some(f => f.name === name && f._id.toString() !== req.params.fieldId)) {
      return res.status(400).json({ error: 'Field name must be unique within the form' });
    }

    if (label !== undefined) field.label = label;
    if (type !== undefined) field.type = type;
    if (name !== undefined) field.name = name;
    if (required !== undefined) field.required = required;
    if (options !== undefined) field.options = options;
    if (validation !== undefined) field.validation = validation;
    if (order !== undefined) field.order = order;

    await form.save();
    res.json(form);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/forms/:id/fields/:fieldId', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    form.fields.id(req.params.fieldId).deleteOne();
    await form.save();

    res.json(form);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/forms/:id/fields/reorder', async (req, res) => {
  try {
    const { fieldOrders } = req.body;
    if (!Array.isArray(fieldOrders)) return res.status(400).json({ error: 'fieldOrders must be an array' });

    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ error: 'Form not found' });

    fieldOrders.forEach(({ fieldId, order }) => {
      const field = form.fields.id(fieldId);
      if (field) field.order = order;
    });

    await form.save();
    res.json(form);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

