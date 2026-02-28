const mongoose = require("mongoose");

const AstroFormSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    number: {
      type: String,
      required: true,
      unique: true
    },
    skills: {
      type: [String],
      required: true
    },
    otp: {
      type: String,
      default: "1234" // static otp
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AstroForm", AstroFormSchema);
