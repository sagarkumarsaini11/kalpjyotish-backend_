const mongoose = require('mongoose');

const TransitSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  slug: { type: String, required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Transit', TransitSchema);
