const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// Public route - create order
router.post('/', orderController.createOrder);

// Admin routes - require authentication
router.get('/', protect, orderController.getAllOrders);
router.put('/:id', protect, orderController.updateOrderStatus);

module.exports = router;
