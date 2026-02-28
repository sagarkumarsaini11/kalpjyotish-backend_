// models/Client.js
const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
    },
    gender: {
      type: String, 
    },
    dateOfBirth: {
      type: String, 
    },
    timeOfBirth: {
      type: String, 
    },
    placeOfBirth: {
      type: String,
    },
    preferredLanguages: [
      {
        id: { type: Number, required: true },
        name: { type: String, required: true },
      },
    ],
    concern: {
      type: String,
      default: null,
    },
    profile: {
      type: String, 
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Client", clientSchema);
