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
  getSoldProducts,
  deleteOldSoldProducts,
  toggleSoldStatus,
  getProductStats,
} from '../controllers/productController.js';
import auth from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/bestsellers', getBestSellerProducts);
router.get('/highlighted', getHighlightedProducts);
router.get('/sold/all', getSoldProducts);
router.get('/:id', getProduct);

// Admin
router.post('/', auth, upload.array('images', 50), createProduct);
router.put('/:id', auth, upload.array('images', 50), updateProduct);
router.delete('/:id', auth, deleteProduct);
router.patch('/:id/toggle-featured', auth, toggleFeatured);
router.patch('/:id/toggle-bestseller', auth, toggleBestSeller);
router.patch('/:id/toggle-highlighted', auth, toggleHighlighted);
router.patch('/:id/toggle-sold', auth, toggleSoldStatus);
router.get('/stats/overview', auth, getProductStats);
router.delete('/admin/sold-items', auth, deleteOldSoldProducts);

export default router;
