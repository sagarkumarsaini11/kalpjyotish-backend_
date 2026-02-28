const mongoose = require("mongoose");

const phoneAuthSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  token: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("PhoneAuth", phoneAuthSchema);
