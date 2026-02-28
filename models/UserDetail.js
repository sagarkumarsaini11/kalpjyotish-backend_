const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  name: String,

  email: { type: String },

  password: { type: String },

  gender: String,

  maritalStatus: {
    type: String,
    default: null
  },

  city: String,

  state: {
    type: String,
    default: null
  },

  country: {
    type: String,
    default: null
  },

  mobileNo: String,

  profile: String, // Cloudinary URL

  dateOfBirth: Date,

  timeOfBirth: String,

  placeOfBirth: {
    type: String,
    default: null
  },

  address: String,

  uid: {
    type: Number,
    unique: true,
    index: true,
    default: null
  },

  fcmToken: { type: String, default: null },

  loginToken: { type: String, default: null },

  firebaseUid: {
    type: String,
  },

  profileCompleted: {
    type: Boolean,
    default: false
  },

  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Astrologer"
    }
  ],

  wallet: {
    balance: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' }
  },

  freeMinutesRemaining: {
    type: Number,
    default: 10
  }

}, { timestamps: true });

module.exports = mongoose.model('UserDetail', userSchema, 'UserDetail');