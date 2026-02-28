const Dropdown = require('../models/Dropdown');

// ✅ Get grouped dropdown items
exports.getDropdownOptions = async (req, res) => {
  try {
    const items = await Dropdown.find();

    // Group by type
    const grouped = items.reduce((acc, curr) => {
      if (!acc[curr.type]) acc[curr.type] = [];
      acc[curr.type].push(curr.value);
      return acc;
    }, {});

    res.status(200).json({
      sucess:true,
      message: 'Astrologers skills fetched successfully',
      data: grouped
    });
  } catch (err) {
    console.error('Dropdown fetch error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ✅ Add new item
exports.addDropdownItem = async (req, res) => {
  try {
    const { type, value } = req.body;

    const existing = await Dropdown.findOne({ type, value });
    if (existing) {
      return res.status(400).json({ message: 'Item already exists in this dropdown' });
    }

    const newItem = new Dropdown({ type, value });
    await newItem.save();

    res.status(201).json({
      message: 'Dropdown item added successfully',
      data: newItem
    });
  } catch (err) {
    console.error('Dropdown add error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ✅ Update item
exports.updateDropdownItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { value } = req.body;

    const updated = await Dropdown.findByIdAndUpdate(id, { value }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Dropdown item not found' });

    res.status(200).json({
      message: 'Dropdown item updated successfully',
      data: updated
    });
  } catch (err) {
    console.error('Dropdown update error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ✅ Delete item
exports.deleteDropdownItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Dropdown.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Dropdown item not found' });

    res.status(200).json({ message: 'Dropdown item deleted successfully' });
  } catch (err) {
    console.error('Dropdown delete error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
