import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function YouMayAlsoLikeManager() {
  const [highlightedProducts, setHighlightedProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    category: '',
    price: '',
    subcategory: '',
    condition: '',
    description: '',
    imageUrls: [],
  });
  const [imageInput, setImageInput] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchHighlightedProducts();
  }, []);

  const fetchHighlightedProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/products/highlighted');
      setHighlightedProducts(Array.isArray(res.data) ? res.data : []);
      setCurrentIndex(0);
    } catch (err) {
      console.error('Error fetching highlighted products:', err);
      setHighlightedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = () => {
    if (imageInput.trim()) {
      setForm((prev) => ({
        ...prev,
        imageUrls: [...prev.imageUrls, imageInput.trim()],
      }));
      setImageInput('');
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setImageFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreviews((prev) => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImageFile = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveImage = (index) => {
    setForm((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      alert('Name and price are required');
      return;
    }

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('price', form.price);
    formData.append('category', form.category);
    formData.append('subcategory', form.subcategory);
    formData.append('condition', form.condition);
    formData.append('imageUrls', JSON.stringify(form.imageUrls));

    imageFiles.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const res = await axios.post('/api/products', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });

      // Add to highlighted automatically on creation
      await axios.patch(`/api/products/${res.data.id}/toggle-highlighted`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      resetForm();
      await fetchHighlightedProducts();
      alert('✨ Item added to "You May Also Like" collection!');
    } catch (err) {
      console.error('Error creating product:', err);
      alert('Error adding item. Please try again.');
    }
  };

  const resetForm = () => {
    setForm({ name: '', category: '', price: '', description: '', imageUrls: [] });
    setImageInput('');
    setImageFiles([]);
    setImagePreviews([]);
  };

  const deleteProduct = async (productId) => {
    if (window.confirm('Remove this item from "You May Also Like"?')) {
      try {
        await axios.delete(`/api/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        await fetchHighlightedProducts();
        alert('✓ Item removed');
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Error deleting item');
      }
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? highlightedProducts.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === highlightedProducts.length - 1 ? 0 : prev + 1));
  };

  const currentProduct = highlightedProducts[currentIndex];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2.5em' }}>
        <p style={{ fontSize: '0.85em', color: '#f4a9a8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5em', fontFamily: '"Crimson Text", serif' }}>
          🌸 You May Also Like
        </p>
        <h1 style={{ fontSize: '3em', color: '#4a5d52', marginBottom: '0.3em', fontFamily: '"Playfair Display", serif', fontWeight: 800, letterSpacing: '-0.02em' }}>Curated Collection</h1>
        <p style={{ fontSize: '1.05em', color: '#7a8d84', fontFamily: '"Crimson Text", serif', lineHeight: '1.6em' }}>Create and manage standalone items for the "You May Also Like" carousel on home page</p>
      </div>

      {/* Add New Item Form */}
      <div style={{ background: '#fff', padding: '2.5em', borderRadius: '12px', border: '1.5px solid', borderImage: 'linear-gradient(135deg, rgba(244, 169, 168, 0.3), rgba(74, 93, 82, 0.1)) 1', marginBottom: '3em', boxShadow: '0 4px 16px rgba(244, 169, 168, 0.08)' }}>
        <h2 style={{ fontSize: '1.6em', color: '#4a5d52', marginBottom: '1.5em', fontFamily: '"Playfair Display", serif', fontWeight: 800 }}>➕ Add New Item</h2>

        <form onSubmit={handleSubmit}>
          {/* Name & Price */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5em', marginBottom: '1.5em' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 700, color: '#4a5d52', marginBottom: '0.6em', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Item Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                style={{ width: '100%', padding: '0.9em 1.2em', borderRadius: '8px', border: '1px solid rgba(74, 93, 82, 0.15)', fontSize: '1em', fontFamily: '"Crimson Text", serif' }}
                placeholder="e.g., Sakura Vase"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 700, color: '#4a5d52', marginBottom: '0.6em', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Price (₱) *
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                style={{ width: '100%', padding: '0.9em 1.2em', borderRadius: '8px', border: '1px solid rgba(74, 93, 82, 0.15)', fontSize: '1em', fontFamily: '"Crimson Text", serif' }}
                placeholder="e.g., 2500"
              />
            </div>
          </div>

          {/* Category & Condition */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5em', marginBottom: '1.5em' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 700, color: '#4a5d52', marginBottom: '0.6em', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Category
              </label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                style={{ width: '100%', padding: '0.9em 1.2em', borderRadius: '8px', border: '1px solid rgba(74, 93, 82, 0.15)', fontSize: '1em', fontFamily: '"Crimson Text", serif' }}
                placeholder="e.g., Decor"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 700, color: '#4a5d52', marginBottom: '0.6em', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Condition
              </label>
              <input
                type="text"
                value={form.condition}
                onChange={(e) => setForm((prev) => ({ ...prev, condition: e.target.value }))}
                style={{ width: '100%', padding: '0.9em 1.2em', borderRadius: '8px', border: '1px solid rgba(74, 93, 82, 0.15)', fontSize: '1em', fontFamily: '"Crimson Text", serif' }}
                placeholder="e.g., Like New"
              />
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.5em' }}>
            <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 700, color: '#4a5d52', marginBottom: '0.6em', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              style={{ width: '100%', padding: '0.9em 1.2em', borderRadius: '8px', border: '1px solid rgba(74, 93, 82, 0.15)', fontSize: '1em', fontFamily: '"Crimson Text", serif', minHeight: '120px', resize: 'vertical' }}
              placeholder="Describe the item..."
            />
          </div>

          {/* Images Section */}
          <details style={{ marginBottom: '2em', padding: '1.2em', background: 'rgba(244, 169, 168, 0.05)', borderRadius: '8px', border: '1px solid rgba(244, 169, 168, 0.15)', cursor: 'pointer' }}>
            <summary style={{ fontSize: '1.1em', fontWeight: 700, color: '#4a5d52', cursor: 'pointer', userSelect: 'none' }}>📸 Upload Images</summary>

            <div style={{ marginTop: '1.5em' }}>
              {/* File Upload Section */}
              <div style={{ marginBottom: '2em', padding: '2.5em', border: '2px dashed #f4a9a8', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(244, 169, 168, 0.08), rgba(244, 169, 168, 0.03))', transition: 'all 0.3s ease', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#e8918e'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(244, 169, 168, 0.12), rgba(244, 169, 168, 0.06))'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#f4a9a8'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(244, 169, 168, 0.08), rgba(244, 169, 168, 0.03))'; }}
              >
                <label style={{ display: 'block', fontWeight: 700, color: '#4a5d52', marginBottom: '0.75em', fontSize: '1.05em', cursor: 'pointer', fontFamily: '"Crimson Text", serif' }}>📸 Upload Images from Your PC</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'block', width: '100%', cursor: 'pointer' }}
                />
                <p style={{ fontSize: '0.85em', color: '#919499', margin: '1em 0 0 0', lineHeight: '1.5em' }}>PNG, JPG, or GIF • Up to 10 images • Recommended: High quality photos</p>
              </div>

              {/* File Previews */}
              {imagePreviews.length > 0 && (
                <div style={{ marginBottom: '2em' }}>
                  <p style={{ fontSize: '0.9em', fontWeight: 600, color: '#2f333b', marginBottom: '1em' }}>Selected Files ({imagePreviews.length})</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '1.2em' }}>
                    {imagePreviews.map((preview, index) => (
                      <div key={index} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', background: '#f3f3f3', border: '2px solid #e97770', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                        <img src={preview} alt={`Preview ${index + 1}`} style={{ width: '100%', height: '110px', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => removeImageFile(index)}
                          style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(233, 119, 112, 0.95)', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', transition: 'all 0.2s ease' }}
                          onMouseEnter={(e) => { e.target.style.background = 'rgba(217, 95, 86, 0.95)'; e.target.style.transform = 'scale(1.1)'; }}
                          onMouseLeave={(e) => { e.target.style.background = 'rgba(233, 119, 112, 0.95)'; e.target.style.transform = 'scale(1)'; }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* URL Paste Section */}
              <div style={{ marginTop: '1.5em', paddingTop: '1.5em', borderTop: '1px solid rgba(244, 169, 168, 0.2)' }}>
                <p style={{ fontSize: '0.9em', fontWeight: 600, color: '#4a5d52', marginBottom: '0.8em' }}>Or paste image URLs</p>
                <div style={{ display: 'flex', gap: '0.8em' }}>
                  <input
                    type="url"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    style={{ flex: 1, padding: '0.85em 1.2em', borderRadius: '8px', border: '1px solid rgba(74, 93, 82, 0.15)', fontSize: '0.95em', fontFamily: '"Crimson Text", serif' }}
                    placeholder="Paste image URL here..."
                  />
                  <button type="button" onClick={handleAddImage} style={{ padding: '0.85em 1.5em', background: 'linear-gradient(135deg, #f4a9a8, #e8918e)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s ease' }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    Add URL
                  </button>
                </div>

                {form.imageUrls.length > 0 && (
                  <div style={{ marginTop: '1.2em' }}>
                    <p style={{ fontSize: '0.9em', fontWeight: 600, color: '#2f333b', marginBottom: '0.8em' }}>Pasted URLs ({form.imageUrls.length})</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '1em' }}>
                      {form.imageUrls.map((url, idx) => (
                        <div key={idx} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', background: '#f3f3f3', border: '2px solid #919499' }}>
                          <img src={url} alt={`URL-${idx}`} style={{ width: '100%', height: '110px', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(217, 95, 86, 0.95)', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}
                            onMouseEnter={(e) => { e.target.style.background = 'rgba(233, 119, 112, 0.95)'; e.target.style.transform = 'scale(1.1)'; }}
                            onMouseLeave={(e) => { e.target.style.background = 'rgba(217, 95, 86, 0.95)'; e.target.style.transform = 'scale(1)'; }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </details>

          {/* Submit Button */}
          <button type="submit" style={{ width: '100%', padding: '1.2em 2.5em', background: 'linear-gradient(135deg, #f4a9a8, #e8918e)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1.05em', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 8px 20px rgba(244, 169, 168, 0.3)', fontFamily: '"Crimson Text", serif' }}
            onMouseEnter={(e) => { e.target.style.transform = 'translateY(-4px)'; e.target.style.boxShadow = '0 12px 32px rgba(244, 169, 168, 0.4)'; }}
            onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 8px 20px rgba(244, 169, 168, 0.3)'; }}
          >
            ✨ Add to Collection
          </button>
        </form>
      </div>

      {/* Collection Preview - Prev/Next Navigation */}
      {highlightedProducts.length > 0 ? (
        <div style={{ background: '#fff', padding: '2.5em', borderRadius: '12px', border: '1.5px solid', borderImage: 'linear-gradient(135deg, rgba(244, 169, 168, 0.3), rgba(74, 93, 82, 0.1)) 1', boxShadow: '0 4px 16px rgba(244, 169, 168, 0.08)' }}>
          <h2 style={{ fontSize: '1.6em', color: '#4a5d52', marginBottom: '1.5em', fontFamily: '"Playfair Display", serif', fontWeight: 800 }}>📂 Collection Preview</h2>

          {currentProduct && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5em', alignItems: 'start' }}>
              {/* Product Image */}
              <div style={{ background: 'linear-gradient(135deg, #faf9f7, #f5f3f0)', borderRadius: '12px', height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img src={currentProduct.imageUrls?.[0] || 'https://via.placeholder.com/400x350'} alt={currentProduct.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>

              {/* Product Details */}
              <div>
                <div style={{ marginBottom: '1.5em' }}>
                  <p style={{ fontSize: '0.8em', color: '#f4a9a8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5em' }}>Item {currentIndex + 1} of {highlightedProducts.length}</p>
                  <h3 style={{ fontSize: '2em', color: '#3d5247', fontFamily: '"Playfair Display", serif', fontWeight: 800, marginBottom: '0.5em', letterSpacing: '-0.01em' }}>
                    {currentProduct.name}
                  </h3>
                  {currentProduct.category && (
                    <p style={{ fontSize: '0.9em', color: '#7a8d84', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5em' }}>
                      📌 {currentProduct.category}
                    </p>
                  )}
                  <p style={{ fontSize: '1.6em', color: '#f4a9a8', fontWeight: 800, fontFamily: '"Playfair Display", serif', marginTop: '1em' }}>
                    ₱{Math.round(currentProduct.price).toLocaleString()}
                  </p>
                </div>

                {currentProduct.description && (
                  <div style={{ marginBottom: '1.5em', padding: '1.2em', background: 'rgba(244, 169, 168, 0.05)', borderRadius: '8px', border: '1px solid rgba(244, 169, 168, 0.15)' }}>
                    <p style={{ color: '#5a6b65', lineHeight: '1.7em', fontSize: '0.95em', fontFamily: '"Crimson Text", serif' }}>
                      {currentProduct.description}
                    </p>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div style={{ display: 'flex', gap: '1em', marginTop: '2em' }}>
                  <button onClick={goToPrevious} style={{ flex: 1, padding: '1em 1.5em', background: 'linear-gradient(135deg, #4a5d52, #3d4f47)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.95em', cursor: 'pointer', transition: 'all 0.3s ease', fontFamily: '"Crimson Text", serif', textTransform: 'uppercase', letterSpacing: '0.08em' }}
                    onMouseEnter={(e) => { e.target.style.transform = 'translateY(-3px)'; e.target.style.boxShadow = '0 8px 20px rgba(74, 93, 82, 0.3)'; }}
                    onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
                  >
                    ← Previous
                  </button>
                  <button onClick={goToNext} style={{ flex: 1, padding: '1em 1.5em', background: 'linear-gradient(135deg, #4a5d52, #3d4f47)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.95em', cursor: 'pointer', transition: 'all 0.3s ease', fontFamily: '"Crimson Text", serif', textTransform: 'uppercase', letterSpacing: '0.08em' }}
                    onMouseEnter={(e) => { e.target.style.transform = 'translateY(-3px)'; e.target.style.boxShadow = '0 8px 20px rgba(74, 93, 82, 0.3)'; }}
                    onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
                  >
                    Next →
                  </button>
                </div>

                {/* Delete Button */}
                <button onClick={() => deleteProduct(currentProduct.id)} style={{ width: '100%', marginTop: '1em', padding: '0.8em 1.5em', background: 'rgba(217, 95, 86, 0.15)', color: '#d95f56', border: '1.5px solid #d95f56', borderRadius: '8px', fontWeight: 700, fontSize: '0.9em', cursor: 'pointer', transition: 'all 0.3s ease', fontFamily: '"Crimson Text", serif', textTransform: 'uppercase', letterSpacing: '0.08em' }}
                  onMouseEnter={(e) => { e.target.style.background = 'rgba(217, 95, 86, 0.25)'; }}
                  onMouseLeave={(e) => { e.target.style.background = 'rgba(217, 95, 86, 0.15)'; }}
                >
                  🗑️ Remove from Collection
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4em 2em', background: 'rgba(244, 169, 168, 0.08)', borderRadius: '12px', border: '2px dashed rgba(244, 169, 168, 0.3)' }}>
          <p style={{ fontSize: '1.1em', color: '#7a8d84', fontFamily: '"Crimson Text", serif' }}>No items in collection yet. Add one using the form above! 🌸</p>
        </div>
      )}
    </div>
  );
}
