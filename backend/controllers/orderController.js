const Order = require('../models/Order');

// Create a new order (public)
exports.createOrder = async (req, res) => {
    try {
        const { items, total, customer } = req.body;

        if (!items || !items.length) {
            return res.status(400).json({ success: false, message: 'No items in order' });
        }

        if (!customer || !customer.name || !customer.phone) {
            return res.status(400).json({ success: false, message: 'Customer name and phone are required' });
        }

        const order = new Order({
            items,
            total,
            customer,
            status: 'pending'
        });

        await order.save();

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order: {
                id: order._id,
                total: order.total,
                status: order.status,
                createdAt: order.createdAt
            }
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ success: false, message: 'Failed to create order' });
    }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const status = req.query.status;

        const query = status ? { status } : {};

        const [orders, total] = await Promise.all([
            Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Order.countDocuments(query)
        ]);

        res.json({
            success: true,
            orders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
};

// Get single order by ID (admin only)
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({ success: true, order });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch order' });
    }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'confirmed', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const order = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({
            success: true,
            message: 'Order status updated',
            order
        });
    } catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({ success: false, message: 'Failed to update order' });
    }
};
