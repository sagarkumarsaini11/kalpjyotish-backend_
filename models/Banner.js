const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const bannerSchema = new mongoose.Schema({
  images: [
    {
      _id: { type: String, default: uuidv4 }, // Unique ID
      url: { type: String, required: true }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
