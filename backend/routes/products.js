const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleStock,
  getCategories
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, createProduct);

router.get('/categories', getCategories);

router.route('/:id')
  .get(getProduct)
  .put(protect, updateProduct)
  .delete(protect, deleteProduct);

router.patch('/:id/stock', protect, toggleStock);

module.exports = router;
