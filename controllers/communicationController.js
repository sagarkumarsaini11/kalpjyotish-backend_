const CommunicationRequest = require('../models/CommunicationRequest');
const User = require('../models/UserDetail');
const Astrologer = require('../models/Astrologer');

// Request communication
exports.requestCommunication = async (req, res) => {
  try {
    const { userId, astrologerId, type } = req.body;

    if (!['chat', 'call', 'videoCall'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid communication type' });
    }

    const user = await User.findById(userId);
    const astrologer = await Astrologer.findById(astrologerId);

    if (!user || !astrologer) {
      return res.status(404).json({ success: false, message: 'User or Astrologer not found' });
    }

    const request = new CommunicationRequest({
      user: userId,
      astrologer: astrologerId,
      type
    });

    await request.save();

    const populatedRequest = await CommunicationRequest.findById(request._id)
      .populate('user', 'name email mobileNo')
      .populate('astrologer', 'name email number');

    res.status(201).json({
      success: true,
      message: `${type} request sent successfully`,
      data: populatedRequest
    });
  } catch (err) {
    console.error('Communication request error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};



// Get all requests for an astrologer
exports.getRequestsForAstrologer = async (req, res) => {
  try {
    const { astrologerId } = req.params;

    const requests = await CommunicationRequest.find({ astrologer: astrologerId })
      .populate('user', 'name email profile')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (err) {
    console.error('Fetching requests error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!['accepted', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const updatedRequest = await CommunicationRequest.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    )
      .populate('user', 'name email mobileNo')
      .populate('astrologer', 'name email number');

    if (!updatedRequest) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.status(200).json({
      success: true,
      message: `Request status updated to ${status}`,
      data: updatedRequest
    });
  } catch (err) {
    console.error('Update request error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


// ✅ Get all communication requests for a specific user
exports.getRequestsForUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user existence
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Fetch all requests by userId
    const requests = await CommunicationRequest.find({ user: userId })
      .populate("astrologer", "name email number profile")
      .sort({ createdAt: -1 });

    // If no history found
    if (!requests || requests.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No communication history found for this user",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "User communication history fetched successfully",
      data: requests,
    });
  } catch (err) {
    console.error("Fetching user communication history error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user communication history",
      error: err.message,
    });
  }
};
