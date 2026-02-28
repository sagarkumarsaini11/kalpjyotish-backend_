const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  images: [{ type: String }], // Array of image URLs
  description: { type: String },
  enquiryBtn: { type: String },
  price: { type: Number, required: true },
  oldPrice: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
