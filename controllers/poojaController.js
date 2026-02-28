 const Pooja = require('../models/Pooja');

exports.createPooja = async (req, res) => {
  try {
    const { name, description, price, enquiryBtn } = req.body;
    const image = req.file ? req.file.path : null;

    // Validation
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: "Name and price are required",
      });
    }

    // Convert "\n" to real line breaks
    const formattedDescription = description
      ? description.replace(/\\n/g, "\n")
      : "";

    const newPooja = new Pooja({
      name,
      description: formattedDescription,
      price,
      image,
      enquiryBtn
    });

    await newPooja.save();

    res.status(201).json({
      success: true,
      message: "Pooja created successfully",
      data: newPooja,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create pooja",
      error: error.message,
    });
  }
};



exports.getAllPoojas = async (req, res) => {
  try {
    const poojas = await Pooja.find();

    res.status(200).json({
      success: true,
      message: "Poojas fetched successfully",
      data: poojas,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch poojas",
      error: error.message,
    });
  }
};


exports.getPoojaById = async (req, res) => {
  try {
    const pooja = await Pooja.findById(req.params.id);
    if (!pooja) return res.status(404).json({ message: 'Pooja not found' });
    res.status(200).json({ data: pooja });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pooja', error });
  }
};

exports.updatePooja = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, enquiryBtn } = req.body;

    // Convert "\\n" into actual line breaks
    const formattedDescription = description
      ? description.replace(/\\n/g, "\n")
      : undefined;

    const updateData = {};

    if (name) updateData.name = name;
    if (price) updateData.price = price;
    if (enquiryBtn) updateData.enquiryBtn = enquiryBtn;
    if (formattedDescription !== undefined)
      updateData.description = formattedDescription;

    // If a new image is uploaded, update it
    if (req.file) {
      updateData.image = req.file.path;
    }

    const updatedPooja = await Pooja.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedPooja) {
      return res.status(404).json({
        success: false,
        message: "Pooja not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Pooja updated successfully",
      data: updatedPooja,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update pooja",
      error: error.message,
    });
  }
};



exports.deletePooja = async (req, res) => {
  try {
    await Pooja.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Pooja deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting pooja', error });
  }
};
