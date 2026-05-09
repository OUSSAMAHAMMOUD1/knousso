const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const Settings = require('../models/Settings');

const router = express.Router();

const DEFAULT_IMAGES = [];

// GET /api/settings/slideshow — public
router.get('/slideshow', async (req, res) => {
  try {
    const doc = await Settings.findOne({ key: 'slideshow' });
    res.json({ images: doc?.value || DEFAULT_IMAGES });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/settings/slideshow — admin only
router.put('/slideshow', protect, adminOnly, async (req, res) => {
  try {
    const { images } = req.body;
    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: 'images array required' });
    }
    const doc = await Settings.findOneAndUpdate(
      { key: 'slideshow' },
      { value: images },
      { upsert: true, new: true }
    );
    res.json({ images: doc.value });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
