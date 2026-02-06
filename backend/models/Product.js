import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    imageUrls: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
    },
    subcategory: {
      type: String,
    },
    condition: {
      type: String,
      enum: ['New', 'Used'],
      default: 'New',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isHighlighted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
