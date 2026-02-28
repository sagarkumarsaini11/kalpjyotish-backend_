// controllers/adminController.js
const Admin = require('../models/Admin');

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email });

    if (!admin || admin.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Optionally remove password from response
    const { password: _, ...adminData } = admin.toObject();

    res.status(200).json({
      message: 'Login successful',
      admin: adminData
    });

  } catch (error) {
    console.error('Admin Login Error:', error.message || error);
    res.status(500).json({ message: 'Login failed', error: error.message || error });
  }
};


const registerAdmin = async (req, res) => {
  try {
    const { name, email, number, password } = req.body;

    if (!name || !email || !number || !password || !req.file) {
      return res.status(400).json({ message: 'All fields and profile image are required' });
    }

    // Check for duplicate email
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({ message: 'Admin with this email already exists' });
    }

    // Multer + Cloudinary automatically stores file, get the URL
    const profileUrl = req.file.path;

    const newAdmin = new Admin({
      name,
      email,
      number,
      password,
      profile: profileUrl
    });

    await newAdmin.save();

    res.status(201).json({
      message: 'Admin registered successfully',
      admin: {
        _id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        number: newAdmin.number,
        profile: newAdmin.profile
      }
    });

  } catch (error) {
    console.error('Register Admin Error:', error.message || error);
    res.status(500).json({ message: 'Failed to register admin', error: error.message || error });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin, // assuming you already have loginAdmin here
};
