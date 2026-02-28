const Transit = require('../models/Transit');

// Create
exports.createTransit = async (req, res) => {
  try {
    const { title, description, slug } = req.body;
    const image = req.file?.path;

    const newTransit = new Transit({ title, description, slug, image });
    await newTransit.save();
    res.status(201).json({ message: 'Transit created', data: newTransit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read All
exports.getAllTransits = async (req, res) => {
  try {
    const transits = await Transit.find();

    if (!transits || transits.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No transit data found",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Transits fetched successfully",
      data: transits,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};


// Read Single
exports.getTransitById = async (req, res) => {
  try {
    const transit = await Transit.findById(req.params.id);
    if (!transit) return res.status(404).json({ error: 'Not found' });
    res.status(200).json({ data: transit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateTransit = async (req, res) => {
  try {
    const { title, description, slug } = req.body;
    const image = req.file?.path;

    const updatedData = { title, description, slug };
    if (image) updatedData.image = image;

    const transit = await Transit.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.status(200).json({ message: 'Transit updated', data: transit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete
exports.deleteTransit = async (req, res) => {
  try {
    await Transit.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Transit deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
