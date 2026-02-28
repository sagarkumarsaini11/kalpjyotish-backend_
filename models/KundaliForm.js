const mongoose = require('mongoose');

const KundaliFormSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  location: {
    country: { type: String, required: true },
    state: { type: String, required: true },
    cityOrVillage: { type: String, required: true },
    birthHour: { type: String, required: true } // Ex: "14:30" or "2:30 PM"
  }
}, { timestamps: true });

module.exports = mongoose.model('KundaliForm', KundaliFormSchema);
