const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// POST /api/orders — guest OR authenticated (Cash on Delivery)
router.post('/', async (req, res) => {
  try {
    const { items, total, shippingAddress } = req.body;

    if (!items?.length) return res.status(400).json({ message: 'Panier vide' });
    if (!shippingAddress?.name) return res.status(400).json({ message: 'Nom requis' });
    if (!shippingAddress?.phone) return res.status(400).json({ message: 'Téléphone requis' });
    if (!shippingAddress?.city) return res.status(400).json({ message: 'Ville requise' });
    if (!shippingAddress?.address) return res.status(400).json({ message: 'Adresse requise' });

    // Fetch real prices from DB — never trust client-sent prices
    const productIds = items.map(i => i.product);
    const products = await Product.find({ _id: { $in: productIds } }).select('price');
    const priceMap = Object.fromEntries(products.map(p => [p._id.toString(), p.price]));

    const validatedItems = items.map(item => {
      const realPrice = priceMap[item.product?.toString()];
      if (realPrice === undefined) throw new Error('Produit introuvable');
      return {
        product: item.product,
        size: item.size,
        quantity: Math.max(1, Math.min(20, parseInt(item.quantity) || 1)),
        price: realPrice,
      };
    });

    const calculatedTotal = validatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // Try to get user from token if provided (optional)
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        userId = decoded.id;
      } catch { /* guest order */ }
    }

    const order = await Order.create({
      ...(userId && { user: userId }),
      items: validatedItems,
      total: calculatedTotal,
      shippingAddress,
      paymentMethod: 'cash_on_delivery',
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/orders/my — current user's orders
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name images price')
      .sort('-createdAt');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders — all orders (admin only)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name price images')
      .sort('-createdAt');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/orders/:id/status — admin only
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
