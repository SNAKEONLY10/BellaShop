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
import { getDescriptionPools, upsertDescriptionPools } from '../controllers/descriptionPoolsController.js';
import auth from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/bestsellers', getBestSellerProducts);
router.get('/highlighted', getHighlightedProducts);
router.get('/sold/all', getSoldProducts);

// Admin (specific routes before parameterized :id route)
router.post('/', auth, upload.array('images', 50), createProduct);
router.get('/admin/description-pools', auth, getDescriptionPools);
router.put('/admin/description-pools', auth, upsertDescriptionPools);
router.get('/stats/overview', auth, getProductStats);
router.delete('/admin/sold-items', auth, deleteOldSoldProducts);
router.put('/:id', auth, upload.array('images', 50), updateProduct);
router.delete('/:id', auth, deleteProduct);
router.patch('/:id/toggle-featured', auth, toggleFeatured);
router.patch('/:id/toggle-bestseller', auth, toggleBestSeller);
router.patch('/:id/toggle-highlighted', auth, toggleHighlighted);
router.patch('/:id/toggle-sold', auth, toggleSoldStatus);

// Public parameterized route (last, lowest priority)
router.get('/:id', getProduct);

export default router;
