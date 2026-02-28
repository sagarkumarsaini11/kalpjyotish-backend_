const UserDetail = require('../models/UserDetail.js'); // adjust path as needed
const mongoose = require('mongoose');

// ========================================
// CREATE - Register New User (POST)
// ========================================
const createUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      gender,
    //   city,
    // profile,
      dob,
      tob,
      birthPlace,
      address,
      fcmToken
    } = req.body;

    // Check if user already exists
    if (email) {
      const existingUser = await UserDetail.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
    }

    // Generate unique UID
    const lastUser = await UserDetail.findOne().sort({ uid: -1 });
    const newUid = lastUser && lastUser.uid ? lastUser.uid + 1 : 1001;

    // Create new user
    const newUser = new UserDetail({
      name: fullName,
      email,
      gender,
      // city,
      mobileNo: phone,
      // profile,
      dateOfBirth: dob,
      timeOfBirth: tob,
      placeOfBirth: birthPlace,
      address,
      uid: newUid,
      fcmToken,
      following: [],
      wallet: {
        balance: 0,
        currency: 'INR'
      }
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

// ========================================
// READ - Get All Users (GET)
// ========================================
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      gender,
      city,
      search
    } = req.query;

    // Build filter object
    const filter = {};
    if (gender) filter.gender = gender;
    if (city) filter.city = new RegExp(city, 'i');
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { mobileNo: new RegExp(search, 'i') }
      ];
    }

    const skip = (page - 1) * limit;

    const users = await UserDetail.find(filter)
      .populate('following', 'name email')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await UserDetail.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// ========================================
// READ - Get User by ID (GET)
// ========================================
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const user = await UserDetail.findById(id)
      .populate('following', 'name email profile');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// ========================================
// READ - Get User by UID (GET)
// ========================================
const getUserByUid = async (req, res) => {
  try {
    const { uid } = req.params;

    const user = await UserDetail.findOne({ uid: parseInt(uid) })
      .populate('following', 'name email profile');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get user by UID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// ========================================
// UPDATE - Update User (PUT)
// ========================================
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Prevent updating certain fields
    delete updateData.uid;
    delete updateData._id;
    delete updateData.createdAt;

    // If email is being updated, check for duplicates
    if (updateData.email) {
      const existingUser = await UserDetail.findOne({
        email: updateData.email,
        _id: { $ne: id }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already in use by another user'
        });
      }
    }

    const updatedUser = await UserDetail.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('following', 'name email profile');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// ========================================
// UPDATE - Update Wallet Balance (PUT)
// ========================================
const updateWalletBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, operation } = req.body; // operation: 'add' or 'deduct'

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    if (!amount || typeof amount !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    const user = await UserDetail.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (operation === 'add') {
      user.wallet.balance += amount;
    } else if (operation === 'deduct') {
      if (user.wallet.balance < amount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient wallet balance'
        });
      }
      user.wallet.balance -= amount;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid operation. Use "add" or "deduct"'
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Wallet balance updated successfully',
      data: {
        userId: user._id,
        newBalance: user.wallet.balance,
        currency: user.wallet.currency
      }
    });

  } catch (error) {
    console.error('Update wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating wallet balance',
      error: error.message
    });
  }
};

// ========================================
// UPDATE - Follow/Unfollow Astrologer (PUT)
// ========================================
const toggleFollowAstrologer = async (req, res) => {
  try {
    const { id } = req.params; // user ID
    const { astroId } = req.body; // astrologer ID to follow/unfollow

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(astroId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }

    const user = await UserDetail.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isFollowing = user.following.includes(astroId);

    if (isFollowing) {
      // Unfollow
      user.following = user.following.filter(
        followId => followId.toString() !== astroId
      );
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Unfollowed successfully',
        action: 'unfollowed',
        data: user
      });
    } else {
      // Follow
      user.following.push(astroId);
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Followed successfully',
        action: 'followed',
        data: user
      });
    }

  } catch (error) {
    console.error('Toggle follow error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling follow status',
      error: error.message
    });
  }
};

// ========================================
// UPDATE - Update FCM Token (PUT)
// ========================================
const updateFcmToken = async (req, res) => {
  try {
    const { id } = req.params;
    const { fcmToken } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const user = await UserDetail.findByIdAndUpdate(
      id,
      { fcmToken },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'FCM token updated successfully',
      data: { fcmToken: user.fcmToken }
    });

  } catch (error) {
    console.error('Update FCM token error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating FCM token',
      error: error.message
    });
  }
};

// ========================================
// DELETE - Soft Delete User (PUT)
// ========================================
const softDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Add isDeleted field if you want soft delete
    const user = await UserDetail.findByIdAndUpdate(
      id,
      { 
        isDeleted: true,
        deletedAt: new Date()
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully'
    });

  } catch (error) {
    console.error('Soft delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating user',
      error: error.message
    });
  }
};

// ========================================
// DELETE - Hard Delete User (DELETE)
// ========================================
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const user = await UserDetail.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted permanently'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// ========================================
// EXPORTS
// ========================================
module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  getUserByUid,
  updateUser,
  updateWalletBalance,
  toggleFollowAstrologer,
  updateFcmToken,
  softDeleteUser,
  deleteUser
};