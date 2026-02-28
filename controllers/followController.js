const FollowAstrologer = require("../models/FollowAstrologer");
const User = require("../models/UserDetail");
const mongoose = require("mongoose");
const Astrologer = require("../models/Astrologer");


exports.followUnfollowAstrologer = async (req, res) => {
  try {
    const { userId, astrologerId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const astro = await Astrologer.findById(astrologerId);
    if (!astro) return res.status(404).json({ message: "Astrologer not found" });

    // Convert to ObjectId
    const astroObjId = new mongoose.Types.ObjectId(astrologerId);

    const isAlreadyFollowing = user.following.some(
      (id) => id.toString() === astrologerId
    );

    if (!isAlreadyFollowing) {
      // FOLLOW
      user.following.push(astroObjId);
      await user.save();
      await FollowAstrologer.create({
        userId: user._id,
        astrologerId: astro._id,
        isFollowed: true
      });
      return res.status(200).json({
        success: true,
        message: "Astrologer followed",
        following: user.following
      });
    } else {
      // UNFOLLOW
      user.following = user.following.filter(
        (id) => id.toString() !== astrologerId
      );
      await user.save();
      await FollowAstrologer.findOneAndDelete({
        userId: user._id,
        astrologerId: astro._id
      });

      return res.status(200).json({
        success: true,
        message: "Astrologer unfollowed",
        following: user.following
      });
    }

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};



