import { db } from '../db.js';
import { products } from '../schema.js';
import { eq, desc, and, lt } from 'drizzle-orm';

// Returns list of products (public)
export const getProducts = async (req, res) => {
  try {
    const allProducts = await db.select().from(products).where(eq(products.status, 'Available')).orderBy(desc(products.createdAt));
    // Parse imageUrls JSON if stored as string
    const parsedProducts = allProducts.map(p => ({
      ...p,
      imageUrls: typeof p.imageUrls === 'string' ? JSON.parse(p.imageUrls || '[]') : []
    }));
    res.json(parsedProducts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Returns a single product by id (public)
export const getProduct = async (req, res) => {
  try {
    const product = await db.select().from(products).where(eq(products.id, parseInt(req.params.id)));
    if (!product || product.length === 0) return res.status(404).json({ message: 'Not found' });
    
    const p = product[0];
    p.imageUrls = typeof p.imageUrls === 'string' ? JSON.parse(p.imageUrls || '[]') : [];
    res.json(p);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Creates a product (admin only). Handles file uploads + optional image URLs
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, subcategory, condition, imageUrls, status, length, width, height } = req.body;
    const conditionDetails = req.body.conditionDetails || null;

    console.log('📝 Creating product...');
    console.log('Body fields:', { name, price, category });
    console.log('Files received:', req.files?.length || 0);
    if (req.files && req.files.length > 0) {
      console.log('File details:', req.files.map(f => ({ 
        originalname: f.originalname, 
        size: f.size,
        secure_url: f.secure_url,
        path: f.path,
        url: f.url 
      })));
    }

    if (!name || !price) {
      console.log('❌ Missing name or price');
      return res.status(400).json({ message: 'Name and price are required' });
    }

    // Build imageUrls array from uploaded files
    let finalImageUrls = [];
    
    // Add uploaded files
    if (req.files && req.files.length > 0) {
      const uploadedUrls = req.files.map(file => {
        const url = file.secure_url || file.url || file.path || `/uploads/${file.filename}`;
        console.log('Using URL:', url);
        return url;
      });
      finalImageUrls = uploadedUrls;
      console.log('✓ Files uploaded:', finalImageUrls);
    }

    if (finalImageUrls.length === 0) {
      console.log('❌ No images provided');
      return res.status(400).json({ message: 'At least one image is required' });
    }

    console.log('Inserting product:', { name, price, category, imageCount: finalImageUrls.length });

    const result = await db.insert(products).values({
      name,
      description: description || null,
      price: parseFloat(price),
      category: category || null,
      subcategory: subcategory || null,
      condition: condition || null,
      imageUrls: JSON.stringify(finalImageUrls),
      status: status || 'Available',
      length: length ? parseFloat(length) : null,
      width: width ? parseFloat(width) : null,
      height: height ? parseFloat(height) : null,
      isFeatured: false,
      isBestSeller: false,
      isHighlighted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      conditionDetails: conditionDetails || null,
    });

    console.log('✓ Product saved to DB, ID:', result.lastInsertRowid);
    res.status(201).json({ 
      id: Number(result.lastInsertRowid),
      name, 
      description, 
      price: parseFloat(price), 
      imageUrls: finalImageUrls, 
      category, 
      subcategory, 
      condition,
      conditionDetails: conditionDetails || null,
      status: status || 'Available',
      length: length ? parseFloat(length) : null,
      width: width ? parseFloat(width) : null,
      height: height ? parseFloat(height) : null,
      isFeatured: false,
      isBestSeller: false,

    });
  } catch (err) {
    console.error('❌ Error creating product:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Updates a product (admin only). Handles new file uploads + existing/new image URLs
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, subcategory, condition, imageUrls, status, length, width, height, conditionDetails } = req.body;

    console.log('📝 Updating product:', id);
    console.log('Files received:', req.files?.length || 0);
    console.log('Image URLs in body:', imageUrls);

    let finalImageUrls = [];
    
    // Add existing/pasted image URLs first
    if (imageUrls) {
      try {
        if (typeof imageUrls === 'string') {
          finalImageUrls = JSON.parse(imageUrls);
        } else if (Array.isArray(imageUrls)) {
          finalImageUrls = imageUrls;
        }
      } catch (e) {
        console.log('Could not parse imageUrls');
      }
    }
    
    // Add newly uploaded files
    if (req.files && req.files.length > 0) {
      const newFileUrls = req.files.map(file => file.path || file.secure_url || file.url || (`/uploads/${file.filename}`));
      finalImageUrls = [...finalImageUrls, ...newFileUrls];
      console.log('✓ New files uploaded (Cloudinary):', newFileUrls);
    }

    console.log('Final image URLs:', finalImageUrls);

    await db.update(products)
      .set({
        name,
        description: description || null,
        price: parseFloat(price),
        imageUrls: JSON.stringify(finalImageUrls),
        category: category || null,
        subcategory: subcategory || null,
        condition: condition || null,
        status: status || 'Available',
        length: length ? parseFloat(length) : null,
        width: width ? parseFloat(width) : null,
        height: height ? parseFloat(height) : null,
        conditionDetails: conditionDetails || null,
        isBestSeller: req.body.isBestSeller ? true : false,
        updatedAt: new Date(),
      })
      .where(eq(products.id, parseInt(id)));

    const updatedProduct = await db.select().from(products).where(eq(products.id, parseInt(id)));
    
    if (!updatedProduct || updatedProduct.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const p = updatedProduct[0];
    p.imageUrls = JSON.parse(p.imageUrls || '[]');
    console.log('✓ Product updated');
    res.json(p);
  } catch (err) {
    console.error('❌ Error updating product:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Deletes a product (admin only)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await db.select().from(products).where(eq(products.id, parseInt(id)));
    
    if (!product || product.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await db.delete(products).where(eq(products.id, parseInt(id)));
    
    res.json({ message: 'Product deleted', product: product[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle featured status (admin only)
export const toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await db.select().from(products).where(eq(products.id, parseInt(id)));

    if (!product || product.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const p = product[0];
    const newFeaturedStatus = !p.isFeatured;

    await db.update(products)
      .set({ isFeatured: newFeaturedStatus, updatedAt: new Date() })
      .where(eq(products.id, parseInt(id)));

    p.isFeatured = newFeaturedStatus;
    p.imageUrls = JSON.parse(p.imageUrls || '[]');
    
    res.json({ message: 'Featured status updated', product: p });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get featured products (public)
export const getFeaturedProducts = async (req, res) => {
  try {
    const featuredProducts = await db.select().from(products)
      .where(eq(products.isFeatured, true))
      .orderBy(desc(products.createdAt));
    
    const parsed = featuredProducts.map(p => ({
      ...p,
      imageUrls: JSON.parse(p.imageUrls || '[]')
    }));
    
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle best seller status (admin only)
export const toggleBestSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await db.select().from(products).where(eq(products.id, parseInt(id)));

    if (!product || product.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const p = product[0];
    const newBestSellerStatus = !p.isBestSeller;

    await db.update(products)
      .set({ isBestSeller: newBestSellerStatus, updatedAt: new Date() })
      .where(eq(products.id, parseInt(id)));

    p.isBestSeller = newBestSellerStatus;
    p.imageUrls = JSON.parse(p.imageUrls || '[]');
    
    res.json({ message: 'Best seller status updated', product: p });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get best seller products (public)
export const getBestSellerProducts = async (req, res) => {
  try {
    const bestSellerProducts = await db.select().from(products)
      .where(eq(products.isBestSeller, true))
      .orderBy(desc(products.createdAt));
    
    const parsed = bestSellerProducts.map(p => ({
      ...p,
      imageUrls: JSON.parse(p.imageUrls || '[]')
    }));
    
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle highlighted status (admin only) - For "You May Also Like" section
export const toggleHighlighted = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await db.select().from(products).where(eq(products.id, parseInt(id)));

    if (!product || product.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const p = product[0];
    const newHighlightedStatus = !p.isHighlighted;

    await db.update(products)
      .set({ isHighlighted: newHighlightedStatus, updatedAt: new Date() })
      .where(eq(products.id, parseInt(id)));

    p.isHighlighted = newHighlightedStatus;
    p.imageUrls = JSON.parse(p.imageUrls || '[]');
    
    res.json({ message: 'Highlighted status updated', product: p });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get highlighted products (public) - For "You May Also Like" section
export const getHighlightedProducts = async (req, res) => {
  try {
    const highlightedProducts = await db.select().from(products)
      .where(eq(products.isHighlighted, true))
      .orderBy(desc(products.createdAt));
    
    const parsed = highlightedProducts.map(p => ({
      ...p,
      imageUrls: JSON.parse(p.imageUrls || '[]')
    }));
    
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get sold products (public) - For "Sold Items" section on Home
export const getSoldProducts = async (req, res) => {
  try {
    const soldProducts = await db.select().from(products)
      .where(eq(products.status, 'Sold'))
      .orderBy(desc(products.soldAt));
    
    const parsed = soldProducts.map(p => ({
      ...p,
      imageUrls: JSON.parse(p.imageUrls || '[]')
    }));
    
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle product status between Available and Sold (admin only)
export const toggleSoldStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await db.select().from(products).where(eq(products.id, parseInt(id)));

    if (!product || product.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const p = product[0];
    const newStatus = p.status === 'Sold' ? 'Available' : 'Sold';
    
    // Set soldAt when marking as sold, clear it when marking as available
    const soldAt = newStatus === 'Sold' ? new Date() : null;

    await db.update(products)
      .set({ status: newStatus, updatedAt: new Date(), soldAt })
      .where(eq(products.id, parseInt(id)));

    p.status = newStatus;
    p.soldAt = soldAt;
    p.imageUrls = JSON.parse(p.imageUrls || '[]');
    
    res.json({ message: 'Product status updated', product: p });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get product statistics (admin only)
export const getProductStats = async (req, res) => {
  try {
    const allProducts = await db.select().from(products);
    
    const total = allProducts.length;
    const available = allProducts.filter(p => p.status !== 'Sold').length;
    const sold = allProducts.filter(p => p.status === 'Sold').length;
    
    res.json({
      total,
      available,
      sold
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete sold products older than 1 month (admin only)
export const deleteOldSoldProducts = async (req, res) => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    // Delete products marked as sold before 1 month ago
    const result = await db.delete(products)
      .where(
        and(
          eq(products.status, 'Sold'),
          lt(products.soldAt, oneMonthAgo)
        )
      );
    
    res.json({ message: `Deleted ${result.changes} old sold products` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
