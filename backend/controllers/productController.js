import { db } from '../db.js';
import { products } from '../schema.js';
import { eq, desc } from 'drizzle-orm';

// Returns list of products (public)
export const getProducts = async (req, res) => {
  try {
    const allProducts = await db.select().from(products).orderBy(desc(products.createdAt));
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
    const { name, description, price, category, subcategory, condition, imageUrls } = req.body;

    console.log('📝 Creating product...');
    console.log('Files received:', req.files?.length || 0);
    console.log('Image URLs in body:', imageUrls);

    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    // Build imageUrls array from uploaded files + optional pasted URLs
    let finalImageUrls = [];
    
    // Add uploaded files
    if (req.files && req.files.length > 0) {
      finalImageUrls = req.files.map(file => `/uploads/${file.filename}`);
      console.log('✓ Files uploaded:', finalImageUrls);
    }
    
    // Add pasted image URLs if provided
    if (imageUrls) {
      try {
        let urlsToAdd = [];
        if (typeof imageUrls === 'string') {
          urlsToAdd = JSON.parse(imageUrls);
        } else if (Array.isArray(imageUrls)) {
          urlsToAdd = imageUrls;
        }
        if (Array.isArray(urlsToAdd)) {
          finalImageUrls = [...finalImageUrls, ...urlsToAdd];
        }
      } catch (e) {
        console.log('Could not parse imageUrls');
      }
    }

    console.log('Final image URLs:', finalImageUrls);

    const result = await db.insert(products).values({
      name,
      description: description || null,
      price: parseFloat(price),
      category: category || null,
      subcategory: subcategory || null,
      condition: condition || null,
      imageUrls: JSON.stringify(finalImageUrls),
      isFeatured: false,
      isBestSeller: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('✓ Product saved to DB');
    res.status(201).json({ 
      id: Number(result.lastInsertRowid),
      name, 
      description, 
      price: parseFloat(price), 
      imageUrls: finalImageUrls, 
      category, 
      subcategory, 
      condition,
      isFeatured: false,
      isBestSeller: false
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
    const { name, description, price, category, subcategory, condition, imageUrls } = req.body;

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
      const newFileUrls = req.files.map(file => `/uploads/${file.filename}`);
      finalImageUrls = [...finalImageUrls, ...newFileUrls];
      console.log('✓ New files uploaded:', newFileUrls);
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

