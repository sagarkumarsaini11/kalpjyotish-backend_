const PrivacyPolicy = require('../models/privacyPolicyModel');

// GET: Get latest Privacy Policy
exports.getPrivacyPolicy = async (req, res) => {
  try {
    const policy = await PrivacyPolicy.findOne().sort({ updatedAt: -1 });
    if (!policy) {
      return res.status(404).json({ message: 'Privacy Policy not found' });
    }
    res.status(200).json(policy);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// POST: Add a new Privacy Policy
exports.addPrivacyPolicy = async (req, res) => {
  try {
    const { content } = req.body;
    const newPolicy = await PrivacyPolicy.create({ content });
    res.status(201).json(newPolicy);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create policy' });
  }
};

// PATCH: Update existing Privacy Policy
exports.updatePrivacyPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const updated = await PrivacyPolicy.findByIdAndUpdate(id, { content, updatedAt: Date.now() }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Policy not found' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update policy' });
  }
};

// DELETE: Delete a Privacy Policy
exports.deletePrivacyPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await PrivacyPolicy.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Policy not found' });
    res.status(200).json({ message: 'Policy deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete policy' });
  }
};
