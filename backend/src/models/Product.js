const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 1000 },
  price: { type: Number, required: true, min: 0 },
  images: [{ type: String }],
  category: { type: String, trim: true, enum: ['Oxford', 'Derby', 'Mocassin', 'Brogue', 'Sneaker', 'Boot', 'Autre'], default: 'Autre' },
  sizes: [{
    type: Number,
    enum: [39, 40, 41, 42, 43, 44, 45],
  }],
  stock: { type: Number, default: 100, min: 0 },
  isNewArrival: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model('Product', productSchema);
