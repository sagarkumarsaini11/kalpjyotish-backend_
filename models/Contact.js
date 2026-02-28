const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
  },
  mobile: {
    type: String,
    required: [true, "Mobile number is required"],
    match: [/^[0-9]{10}$/, "Enter a valid 10-digit mobile number"],
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: [true, "Gender is required"],
  },
  dob_time: {
    type: String,
    required: [true, "Date and time of birth is required"],
  },
  place_of_birth: {
    type: String,
    required: [true, "Place of birth is required"],
  },
  query: {
    type: String,
    required: [true, "Query is required"],
    maxlength: [500, "Query cannot exceed 500 characters"],
  },
}, { timestamps: true });

module.exports = mongoose.model("Contact", contactSchema);
