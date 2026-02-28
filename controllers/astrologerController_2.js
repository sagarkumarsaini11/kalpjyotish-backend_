// controllers/astrologerController.js
const Astrologer = require("../models/AstrologerModel");

// helpers (your generateEID/generatePassword)
const generateEID = () => `KALP${Math.floor(1000 + Math.random() * 9000)}`;
const generatePassword = () => Math.random().toString().slice(2, 14);

exports.createAstrologer = async (req, res) => {
  try {
    // debug - you can remove after testing
    console.log("BODY =>", req.body);
    console.log("FILES =>", req.files?.map(f => ({ fieldname: f.fieldname, originalname: f.originalname, path: f.path || f.secure_url || f.url })) );

    const {
      name, age, gender, state, district, city, address,
      speciality, salary, phoneNumber, alternativeNumber,
      email, experience, availability
    } = req.body;

    const files = req.files || [];

    // Helper to get URL from uploaded file (multer-storage-cloudinary gives `path`)
    const getUrl = (file) => file?.path || file?.secure_url || file?.url || null;

    // Strategy:
    // 1) check file.fieldname (if client used 'files' it's 'files')
    // 2) if not, fall back to originalname containing keywords
    const findByName = (keywords = []) => {
      const kw = keywords.map(k => k.toLowerCase());
      return files.find(f => {
        // check fieldname first
        if (f.fieldname && kw.includes(f.fieldname.toLowerCase())) return true;
        // check originalname for keywords
        const on = (f.originalname || "").toLowerCase();
        return kw.some(k => on.includes(k));
      });
    };

    const profileFile = findByName(["profile", "profilephoto", "profilePhoto".toLowerCase()]);
    const adharFile = findByName(["adhar", "aadhar", "adharcard", "aadharcard"]);
    const panFile = findByName(["pan", "pancard", "pan_card"]);
    const bankFile = findByName(["bank", "bankdocument", "bank_doc", "bank_document"]);

    const profilePhoto = getUrl(profileFile);
    const adharCard = getUrl(adharFile);
    const panCard = getUrl(panFile);
    const bankDocument = getUrl(bankFile);

    // Safe parse availability
    let parsedAvailability = {};
    if (availability) {
      if (typeof availability === "string") {
        try {
          parsedAvailability = JSON.parse(availability);
        } catch (err) {
          return res.status(400).json({ success: false, message: "Invalid availability JSON" });
        }
      } else if (typeof availability === "object") {
        parsedAvailability = availability;
      }
    }

    const eid = generateEID();
    const password = generatePassword();

    const newAstrologer = await Astrologer.create({
      eid,
      password,
      name,
      age,
      gender,
      state,
      district,
      city,
      address,
      speciality,
      salary,
      phoneNumber,
      alternativeNumber,
      email,
      experience,
      availability: parsedAvailability,
      profilePhoto,
      bankDocument,
      adharCard,
      panCard
    });

    return res.status(201).json({
      success: true,
      message: "Astrologer registered successfully",
      eid,
      password,
      data: newAstrologer
    });
  } catch (error) {
    console.error("createAstrologer error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};




exports.getAllAstrologers = async (req, res) => {
  try {
    const data = await Astrologer.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAstrologer = async (req, res) => {
  try {
    const data = await Astrologer.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: "Not found" });

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.updateAstrologer = async (req, res) => {
  try {
    let updateData = { ...req.body };

    if (req.files?.profilePhoto) {
      updateData.profilePhoto = req.files.profilePhoto[0].path;
    }
    if (req.files?.bankDocument) {
      updateData.bankDocument = req.files.bankDocument[0].path;
    }
    if (req.files?.adharCard) {
      updateData.adharCard = req.files.adharCard[0].path;
    }
    if (req.files?.panCard) {
      updateData.panCard = req.files.panCard[0].path;
    }

    if (updateData.availability) {
      updateData.availability = JSON.parse(updateData.availability);
    }

    const updated = await Astrologer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.status(200).json({ success: true, message: "Updated successfully", data: updated });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.deleteAstrologer = async (req, res) => {
  try {
    await Astrologer.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Astrologer deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
