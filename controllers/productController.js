const Product = require('../models/Product');

// CREATE Product
const createProduct = async (req, res) => {
  try {
    const { name, description, price, oldPrice } = req.body;
    const images = req.files.map(file => file.path);  // Cloudinary image URLs
    // const images = req.files ? req.files.map(file => file.path) : [];


    const newProduct = new Product({ name, images, description, price, oldPrice });
    await newProduct.save();

    res.status(201).json({ message: 'Product added successfully', data: newProduct });
  } catch (error) {
    console.error('Create Product Error:', error);
    res.status(500).json({ message: 'Something went wrong', error:error.message });
  }
};

const discountPercent = (oldPrice, newPrice) => {
  if (oldPrice <= 0) return 0;
  return ((oldPrice - newPrice) / oldPrice * 100).toFixed(2);
};

// GET all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No products found' });
    }
    const productsWithDiscount = products.map(product => {
      let discountPercent = 0;
      if (product.oldPrice > 0){
        discountPercent = ((product.oldPrice - product.price) / product.oldPrice * 100).toFixed(2);
      }
      return {...product._doc, discountPercent: discountPercent };
    });
    res.status(200).json({ message: 'Products fetched successfully', data: productsWithDiscount });
  } catch (error) {
    console.error('Get Products Error:', error);
    res.status(500).json({ message: 'Failed to fetch products', error });
  }
};

// UPDATE product by ID
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price } = req.body;

    let updatedData = { name, description, price };

    // If new images uploaded
    if (req.files && req.files.length > 0) {
      const images = req.files.map(file => file.path);
      updatedData.images = images;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product updated successfully', data: updatedProduct });
  } catch (error) {
    console.error('Update Product Error:', error);
    res.status(500).json({ message: 'Failed to update product', error });
  }
};

// DELETE Product by ID
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully', data: deletedProduct });
  } catch (error) {
    console.error('Delete Product Error:', error);
    res.status(500).json({ message: 'Failed to delete product', error });
  }
};


module.exports = {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct
};
