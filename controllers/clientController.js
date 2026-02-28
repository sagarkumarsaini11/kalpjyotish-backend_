// controllers/clientController.js
const Client = require("../models/Client");
const UserDetail = require("../models/UserDetail");

exports.signup = async (req, res) => {
  try {
    const {
      name,
      email,
      gender,
      phone,
      dateOfBirth,
      timeOfBirth,
      placeOfBirth,
      preferredLanguages,
      concern,
    } = req.body;

    let profileUrl = null;

    if (req.file && req.file.path) {
      profileUrl = req.file.path; // Cloudinary URL from upload middleware
    }

    // Parse preferredLanguages (should be array of objects [{id, name}, {id, name}])
    let parsedLanguages = [];
    if (preferredLanguages) {
      try {
        parsedLanguages = JSON.parse(preferredLanguages);
      } catch (err) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          message: "preferredLanguages must be a valid JSON array",
        });
      }
    }

    const newClient = new Client({
      name,
      email,
      gender,
      phone,
      dateOfBirth,
      timeOfBirth,
      placeOfBirth,
      preferredLanguages: parsedLanguages,
      concern,
      profile: profileUrl,
    });

    await newClient.save();

    res.status(201).json({
      statusCode: 201,
      success: true,
      message: "Client registered successfully",
      data: newClient,
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};



// ✅ Get Client by ID
exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findById(id);

    if (!client) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Client not found",
      });
    }

    res.status(200).json({
      statusCode: 200,
      success: true,
      data: client,
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};


exports.getUserDetails = async (req, res) => {
  try {
    console.log("req user",req.user);
    
    const { mobile } = req.user;
    const client = await Client.findOne({phone:mobile}).select('-token');

    if (!client) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Client not found",
      });
    }

    res.status(200).json({
      statusCode: 200,
      success: true,
      data: client,
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ✅ Update Client by ID
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      gender,
      dateOfBirth,
      timeOfBirth,
      placeOfBirth,
      preferredLanguages,
      concern,
    } = req.body;

    let updateData = {
      name,
      email,
      gender,
      dateOfBirth,
      timeOfBirth,
      placeOfBirth,
      concern,
    };

    // ✅ Handle preferredLanguages if sent
    if (preferredLanguages) {
      try {
        console.log("preferredLanguage",JSON.parse(preferredLanguages));
        
        updateData.preferredLanguages = JSON.parse(preferredLanguages);
      } catch (err) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          message: "preferredLanguages must be a valid JSON array",
        });
      }
    }

    // ✅ If profile uploaded, update profile field
    if (req.file && req.file.path) {
      updateData.profile = req.file.path; // Cloudinary URL
    }

    const updatedClient = await Client.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedClient) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Client not found",
      });
    }

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Client updated successfully",
      data: updatedClient,
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ✅ Delete Client by ID
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedClient = await Client.findByIdAndDelete(id);

    if (!deletedClient) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Client not found",
      });
    }

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Client deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
