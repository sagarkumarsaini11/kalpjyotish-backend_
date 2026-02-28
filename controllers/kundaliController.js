const KundaliForm = require('../models/KundaliForm');

// POST - Submit Kundali Form
exports.createKundaliForm = async (req, res) => {
  try {
    const form = new KundaliForm(req.body);
    await form.save();
    res.status(201).json({ message: 'Kundali form submitted successfully', data: form });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting form', error: err.message });
  }
};

// GET - All Entries
exports.getAllKundaliForms = async (req, res) => {
  try {
    const forms = await KundaliForm.find();
    res.status(200).json({ message: 'All Kundali forms fetched', data: forms });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching forms', error: err.message });
  }
};

// GET - By ID
exports.getKundaliFormById = async (req, res) => {
  try {
    const form = await KundaliForm.findById(req.params.id);
    if (!form) return res.status(404).json({ message: 'Form not found' });
    res.status(200).json({ message: 'Kundali form fetched', data: form });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching form', error: err.message });
  }
};

// PATCH - Update by ID
exports.updateKundaliForm = async (req, res) => {
  try {
    const form = await KundaliForm.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!form) return res.status(404).json({ message: 'Form not found' });
    res.status(200).json({ message: 'Kundali form updated', data: form });
  } catch (err) {
    res.status(500).json({ message: 'Error updating form', error: err.message });
  }
};

// DELETE - Delete by ID
exports.deleteKundaliForm = async (req, res) => {
  try {
    const form = await KundaliForm.findByIdAndDelete(req.params.id);
    if (!form) return res.status(404).json({ message: 'Form not found' });
    res.status(200).json({ message: 'Kundali form deleted', data: form });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting form', error: err.message });
  }
};
