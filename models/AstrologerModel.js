const mongoose = require("mongoose");

const AstrologerSchema = new mongoose.Schema(
  {
    // 1. Basic Info
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },

    // 2. Location Details
    state: { type: String, required: true },
    district: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },

    // 3. Work Info
    speciality: { type: String, required: true },
    salary: { type: Number, required: true },
    experience: { type: String, required: true },

    // 4. Availability (Chat, Voice, Video)
    availability: {
      chat: { type: Boolean, default: false },
      voice: { type: Boolean, default: false },
      video: { type: Boolean, default: false }
    },

    // 5. Uploaded Files (Cloudinary URLs)
    profilePhoto: { type: String },
    bankDocument: { type: String },
    adharCard: { type: String },
    panCard: { type: String },

    // 6. Contact
    phoneNumber: { type: String, required: true },
    alternateNumber: { type: String },
    email: { type: String, required: true, unique: true },

    // 7. System Generated Credentials
    eid: { type: String, unique: true },        // KALP + random 4 digits
    password: { type: String },                 // 12 digit auto password

    // 8. Status
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// FIX Overwrite Model Error
module.exports =
  mongoose.models.Astrologer ||
  mongoose.model("Astrologer", AstrologerSchema);
