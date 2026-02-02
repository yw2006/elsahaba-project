const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');

// Public route - create order
router.post('/', orderController.createOrder);

// Admin routes - require authentication
router.get('/', auth, orderController.getAllOrders);
router.put('/:id', auth, orderController.updateOrderStatus);

module.exports = router;
