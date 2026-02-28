// models/Admin.js
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  number: { type: String, required: true },
  password: { type: String, required: true },
  profile: { type: String }, // Cloudinary URL
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
