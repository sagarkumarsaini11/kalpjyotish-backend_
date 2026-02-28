// models/Dropdown.js
const mongoose = require('mongoose');

const dropdownSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., 'categories', 'skills', etc.
  value: { type: String, required: true }
});

module.exports = mongoose.model('Dropdown', dropdownSchema);
