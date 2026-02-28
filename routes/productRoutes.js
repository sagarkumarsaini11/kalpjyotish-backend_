const express = require('express');
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { upload } = require('../utilis/cloudinary');

// Add product (POST)
router.post('/add-product', upload.array('images', 10), createProduct);

// Get all products (GET)
router.get('/all', getAllProducts);

// Update product by ID (PUT)
router.put('/update/:id', upload.array('images', 10), updateProduct);
router.delete('/delete-product/:id', deleteProduct);

module.exports = router;
