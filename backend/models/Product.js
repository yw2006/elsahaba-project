const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    ar: {
      type: String,
      required: [true, 'Please provide Arabic product name']
    },
    en: {
      type: String,
      required: [true, 'Please provide English product name']
    }
  },
  price: {
    type: Number,
    required: [true, 'Please provide product price'],
    min: [0, 'Price cannot be negative']
  },
  description: {
    ar: {
      type: String,
      default: ''
    },
    en: {
      type: String,
      default: ''
    }
  },
  image: {
    type: String,
    default: 'images/default-product.svg'
  },
  category: {
    type: String,
    required: [true, 'Please provide product category'],
    enum: {
      values: ['kitchen', 'laundry', 'floor', 'bathroom'],
      message: 'Category must be: kitchen, laundry, floor, or bathroom'
    }
  },
  inStock: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Virtual for id (to match frontend expectations)
productSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
