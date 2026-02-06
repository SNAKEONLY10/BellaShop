import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleFeatured,
  getFeaturedProducts,
  toggleBestSeller,
  getBestSellerProducts,
  toggleHighlighted,
  getHighlightedProducts,
} from '../controllers/productController.js';
import auth from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/bestsellers', getBestSellerProducts);
router.get('/highlighted', getHighlightedProducts);
router.get('/:id', getProduct);

// Admin
router.post('/', auth, upload.array('images', 10), createProduct);
router.put('/:id', auth, upload.array('images', 10), updateProduct);
router.delete('/:id', auth, deleteProduct);
router.patch('/:id/toggle-featured', auth, toggleFeatured);
router.patch('/:id/toggle-bestseller', auth, toggleBestSeller);
router.patch('/:id/toggle-highlighted', auth, toggleHighlighted);

export default router;
