import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FeaturedManager from './FeaturedManager';
import BestsellerManager from './BestsellerManager';
import YouMayAlsoLikeManager from './YouMayAlsoLikeManager';

export default function AdminDashboard() {
  const [view, setView] = useState('inventory');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
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
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/products');
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ name: '', category: '', price: '', description: '', imageUrls: [] });
    setImageInput('');
    setImageFiles([]);
    setImagePreviews([]);
    setEditingId(null);
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

    // Create previews
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

  const submitProduct = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      alert('Name and price are required');
      return;
    }

    try {
      let axiosConfig = { headers: { Authorization: `Bearer ${token}` } };
      
      // Always use FormData for file uploads
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('category', form.category);
      formData.append('price', form.price);
      formData.append('subcategory', form.subcategory || '');
      formData.append('condition', form.condition || '');
      formData.append('description', form.description);

      // Add uploaded files
      if (imageFiles.length > 0) {
        imageFiles.forEach((file) => {
          formData.append('images', file);
        });
      }

      // Add pasted image URLs (filter out blob URLs from file previews)
      const pastedUrls = form.imageUrls.filter(url => !url.startsWith('blob:'));
      if (pastedUrls.length > 0) {
        formData.append('imageUrls', JSON.stringify(pastedUrls));
      } else {
        formData.append('imageUrls', JSON.stringify([]));
      }

      if (editingId) {
        // Update product
        await axios.put(`/api/products/${editingId}`, formData, {
          headers: { ...axiosConfig.headers, 'Content-Type': 'multipart/form-data' },
        });
        alert('Product updated successfully!');
      } else {
        // Create product
        await axios.post('/api/products', formData, {
          headers: { ...axiosConfig.headers, 'Content-Type': 'multipart/form-data' },
        });
        alert('Product added successfully!');
      }
      resetForm();
      await fetchProducts();
      setView('inventory');
    } catch (err) {
      console.error('Error submitting product:', err);
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const deleteProduct = async (id) => {
    console.log('🗑️ Delete clicked. Token:', token ? 'EXISTS' : 'MISSING');
    if (!window.confirm('Are you sure you want to delete this product?')) {
      console.log('❌ Delete cancelled by user');
      return;
    }
    try {
      console.log('📤 Sending DELETE to /api/products/' + id);
      const response = await axios.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('✅ Delete response:', response.data);
      alert('Product deleted successfully!');
      // Refresh the products list
      await fetchProducts();
    } catch (err) {
      console.error('❌ Delete error:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        fullError: err
      });
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const toggleBestSeller = async (id) => {
    try {
      const response = await axios.patch(`/api/products/${id}/toggle-bestseller`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Best seller status updated!');
      await fetchProducts();
    } catch (err) {
      console.error('Error toggling best seller:', err);
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const editProduct = (product) => {
    setForm({
      name: product.name,
      category: product.category || '',
      price: product.price,
      subcategory: product.subcategory || '',
      condition: product.condition || '',
      description: product.description || '',
      imageUrls: product.imageUrls || [],
    });
    setEditingId(product.id);
    setView('add');
  };

  const onLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    window.location.href = '/';
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75em 1em',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    background: '#fff',
    color: '#484d55',
    fontSize: '0.95em',
    boxSizing: 'border-box',
    marginBottom: '1em',
    outline: 'none',
  };

  const buttonStyle = {
    padding: '0.75em 2em',
    background: '#e97770',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9em',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    background: '#919499',
  };

  const deleteButtonStyle = {
    ...buttonStyle,
    background: '#d95f56',
    padding: '0.5em 1em',
    fontSize: '0.85em',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: '100vh', background: 'linear-gradient(135deg, #faf9f7 0%, #f5f3f0 100%)' }}>
      {/* Sidebar - Japanese Aesthetic */}
      <aside style={{ background: 'linear-gradient(180deg, #4a5d52 0%, #3d4f47 100%)', color: '#fff', padding: '2.5em 1.5em', display: 'flex', flexDirection: 'column', minHeight: '100vh', boxShadow: '4px 0 20px rgba(0,0,0,0.1)', position: 'relative' }}>
        {/* Sakura accent */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg, transparent, #f4a9a8, transparent)' }}></div>
        
        <div style={{ textAlign: 'center', marginBottom: '1.5em' }}>
          <div style={{ fontSize: '3.5em', marginBottom: '0.3em' }}>🍂</div>
          <div style={{ fontSize: '1.2em', fontWeight: 800, fontFamily: '"Playfair Display", serif', marginBottom: '0.3em', letterSpacing: '0.05em' }}>KIMM'S</div>
          <div style={{ fontSize: '0.75em', color: '#b8c4be', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 500 }}>Japanese Furniture</div>
          <div style={{ fontSize: '0.65em', color: '#94a399', marginTop: '0.4em' }}>Premium Surplus Collection</div>
        </div>

        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(244,169,168,0.3), transparent)', margin: '1.5em 0 2em 0 ' }}></div>

        <nav style={{ flex: 1 }}>
          {[
            { id: 'inventory', label: '📦 Inventory', icon: '📦' },
            { id: 'add', label: '✨ Add New', icon: '✨' },
            { id: 'bestsellers', label: '🏆 6 Bestsellers', icon: '🏆' },
            { id: 'featured', label: '✨ Featured Slider', icon: '✨' },
            { id: 'youmayalsolike', label: '🌸 You May Also Like', icon: '🌸' },
          ].map((item) => (
            <button key={item.id} onClick={() => setView(item.id)} style={{ width: '100%', padding: '1.1em 1.2em', background: view === item.id ? 'rgba(244, 169, 168, 0.15)' : 'transparent', color: view === item.id ? '#f4a9a8' : 'rgba(255,255,255,0.7)', border: 'none', borderLeft: view === item.id ? '3px solid #f4a9a8' : '3px solid transparent', borderRadius: '0 6px 6px 0', fontSize: '0.95em', fontWeight: view === item.id ? 700 : 500, textAlign: 'left', cursor: 'pointer', transition: 'all 0.3s ease', marginBottom: '0.6em', fontFamily: '"Crimson Text", serif' }}>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(244,169,168,0.3), transparent)', margin: '2em 0 1.5em 0' }}></div>
        
        <button onClick={onLogout} style={{ width: '100%', padding: '0.95em 1.2em', background: 'rgba(244, 169, 168, 0.2)', color: '#f4a9a8', border: '1px solid rgba(244, 169, 168, 0.3)', borderRadius: '6px', fontSize: '0.9em', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', transition: 'all 0.3s ease', fontFamily: '"Crimson Text", serif' }}
          onMouseEnter={(e) => { e.target.style.background = 'rgba(244, 169, 168, 0.3)'; e.target.style.borderColor = 'rgba(244, 169, 168, 0.5)'; }}
          onMouseLeave={(e) => { e.target.style.background = 'rgba(244, 169, 168, 0.2)'; e.target.style.borderColor = 'rgba(244, 169, 168, 0.3)'; }}
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ padding: '3em 3em', overflowY: 'auto', maxHeight: '100vh', background: 'linear-gradient(135deg, #faf9f7 0%, #f5f3f0 100%)' }}>
        {/* Inventory View */}
        {view === 'inventory' && (
          <div>
            <div style={{ marginBottom: '2.5em' }}>
              <p style={{ fontSize: '0.85em', color: '#f4a9a8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5em', fontFamily: '"Crimson Text", serif' }}>📦 Collection Management</p>
              <h1 style={{ fontSize: '3em', color: '#4a5d52', marginBottom: '0.3em', fontFamily: '"Playfair Display", serif', fontWeight: 800, letterSpacing: '-0.02em' }}>Product Inventory</h1>
              <p style={{ fontSize: '1.05em', color: '#7a8d84', fontFamily: '"Crimson Text", serif', lineHeight: '1.6em' }}>Manage your curated collection of premium Japanese furniture pieces</p>
            </div>

            {loading ? (
              <p style={{ fontSize: '1.1em', color: '#7a8d84', textAlign: 'center', padding: '3em' }}>Loading your collection...</p>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4em 2em', background: 'rgba(244, 169, 168, 0.08)', borderRadius: '12px', border: '2px dashed rgba(244, 169, 168, 0.3)', marginTop: '2em' }}>
                <p style={{ color: '#7a8d84', fontSize: '1.15em', marginBottom: '1em', fontFamily: '"Crimson Text", serif' }}>Your inventory is empty</p>
                <button onClick={() => setView('add')} style={{ background: 'linear-gradient(135deg, #f4a9a8, #e8918e)', color: '#fff', border: 'none', padding: '0.85em 2em', borderRadius: '8px', fontSize: '1em', fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s ease' }}
                  onMouseEnter={(e) => { e.target.style.transform = 'translateY(-3px)'; e.target.style.boxShadow = '0 8px 20px rgba(244, 169, 168, 0.3)'; }}
                  onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
                >
                  + Add Your First Piece
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2.5em', marginTop: '2em' }}>
                {products.map((product) => (
                  <div key={product.id} style={{ background: '#fff', padding: '1.8em', borderRadius: '12px', boxShadow: '0 4px 16px rgba(74, 93, 82, 0.08)', position: 'relative', border: '1px solid rgba(244, 169, 168, 0.15)', transition: 'all 0.3s ease', cursor: 'pointer' }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 12px 32px rgba(74, 93, 82, 0.12)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(74, 93, 82, 0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    {product.isBestSeller && (
                      <div style={{ position: 'absolute', top: '1.2em', right: '1.2em', background: 'linear-gradient(135deg, #f4a9a8, #e8918e)', color: '#fff', padding: '0.4em 1em', borderRadius: '20px', fontSize: '0.8em', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 4px 12px rgba(244, 169, 168, 0.3)', fontFamily: '"Playfair Display", serif' }}>
                        ⭐ Best Seller
                      </div>
                    )}
                    {product.imageUrls && product.imageUrls.length > 0 && (
                      <div style={{ marginBottom: '1.2em', borderRadius: '8px', overflow: 'hidden', height: '220px', background: 'linear-gradient(135deg, #f5f3f0, #ebe8e3)', position: 'relative' }}>
                        <img src={product.imageUrls[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                          onMouseEnter={(e) => { e.target.style.transform = 'scale(1.05)'; }}
                          onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}
                        />
                      </div>
                    )}
                    <h3 style={{ fontSize: '1.3em', color: '#4a5d52', marginBottom: '0.4em', fontWeight: 700, fontFamily: '"Playfair Display", serif', letterSpacing: '-0.01em' }}>{product.name}</h3>
                    <p style={{ color: '#7a8d84', fontSize: '0.95em', marginBottom: '0.6em', fontFamily: '"Crimson Text", serif' }}>{product.category || 'Uncategorized'}</p>
                    <p style={{ fontWeight: 700, color: '#f4a9a8', fontSize: '1.15em', marginBottom: '0.6em', fontFamily: '"Playfair Display", serif' }}>₱{product.price?.toLocaleString()}</p>
                    <p style={{ fontSize: '0.85em', color: '#a8bbb2', marginBottom: '1.3em', fontFamily: '"Crimson Text", serif' }}>📸 {product.imageUrls?.length || 0} image{product.imageUrls?.length !== 1 ? 's' : ''}</p>
                    <div style={{ display: 'flex', gap: '0.6em', flexWrap: 'wrap' }}>
                      <button onClick={() => editProduct(product)} style={{ flex: '1 1 auto', minWidth: '65px', padding: '0.8em 1.2em', background: '#4a5d52', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.9em', cursor: 'pointer', transition: 'all 0.3s ease', fontFamily: '"Crimson Text", serif' }}
                        onMouseEnter={(e) => { e.target.style.background = '#3d4f47'; e.target.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={(e) => { e.target.style.background = '#4a5d52'; e.target.style.transform = 'translateY(0)'; }}
                      >✏️ Edit</button>
                      <button onClick={() => toggleBestSeller(product.id)} style={{ flex: '1 1 auto', minWidth: '100px', padding: '0.8em 1.2em', background: product.isBestSeller ? 'linear-gradient(135deg, #f4a9a8, #e8918e)' : 'rgba(244, 169, 168, 0.15)', color: product.isBestSeller ? '#fff' : '#f4a9a8', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.85em', cursor: 'pointer', transition: 'all 0.3s ease', fontFamily: '"Crimson Text", serif' }}
                        onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 4px 12px rgba(244, 169, 168, 0.2)'; }}
                        onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
                      >
                        {product.isBestSeller ? '★ Remove' : '☆ Mark Best'}
                      </button>
                      <button onClick={() => deleteProduct(product.id)} style={{ flex: '1 1 auto', minWidth: '65px', padding: '0.8em 1.2em', background: 'rgba(244, 169, 168, 0.2)', color: '#f4a9a8', border: '1px solid rgba(244, 169, 168, 0.3)', borderRadius: '6px', fontWeight: 700, fontSize: '0.9em', cursor: 'pointer', transition: 'all 0.3s ease', fontFamily: '"Crimson Text", serif' }}
                        onMouseEnter={(e) => { e.target.style.background = 'rgba(244, 169, 168, 0.3)'; e.target.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={(e) => { e.target.style.background = 'rgba(244, 169, 168, 0.2)'; e.target.style.transform = 'translateY(0)'; }}
                      >🗑️ Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add/Edit Product View */}
        {view === 'add' && (
          <div style={{ maxWidth: '750px', margin: '0 auto', background: 'linear-gradient(to bottom, rgba(244, 169, 168, 0.06), transparent)', borderRadius: '16px', padding: '0' }}>
            <div style={{ marginBottom: '2.5em' }}>
              <p style={{ fontSize: '0.85em', color: '#f4a9a8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5em', fontFamily: '"Crimson Text", serif' }}>
                ✨ Curate Your Collection
              </p>
              <h1 style={{ fontSize: '3.2em', color: '#4a5d52', marginBottom: '0.25em', fontFamily: '"Playfair Display", serif', fontWeight: 800, letterSpacing: '-0.02em' }}>
                {editingId ? 'Edit Piece' : 'Add New Piece'}
              </h1>
              <p style={{ fontSize: '1.05em', color: '#7a8d84', lineHeight: '1.7em', fontFamily: '"Crimson Text", serif', maxWidth: '600px' }}>
                {editingId ? 'Update the details of your premium furniture piece.' : 'Add a new premium furniture piece to your collection. Share the beauty and craftsmanship of Japanese design.'}
              </p>
            </div>

            <form onSubmit={submitProduct} style={{ background: 'linear-gradient(135deg, #fff, rgba(245, 243, 240, 0.5))', padding: '3em', borderRadius: '14px', boxShadow: '0 12px 40px rgba(74, 93, 82, 0.1)', border: '1px solid rgba(244, 169, 168, 0.15)' }}>
              <label style={{ display: 'block', marginBottom: '0.6em', fontWeight: 700, color: '#4a5d52', fontSize: '1em', letterSpacing: '0.02em', fontFamily: '"Playfair Display", serif' }}>Product Name *</label>
              <input
                type="text"
                placeholder="e.g., Hinoki Wood Wardrobe, Tansu Chest"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{ width: '100%', fontSize: '1em', padding: '1em 1.2em', borderRadius: '8px', border: '1px solid #e8ddd8', background: '#faf9f7', color: '#4a5d52', boxSizing: 'border-box', marginBottom: '1.5em', outline: 'none', transition: 'all 0.3s ease', fontFamily: '"Crimson Text", serif', letterSpacing: '0.01em' }}
                onFocus={(e) => { e.target.style.background = '#fff'; e.target.style.borderColor = '#f4a9a8'; e.target.style.boxShadow = '0 0 0 3px rgba(244, 169, 168, 0.1)'; }}
                onBlur={(e) => { e.target.style.background = '#faf9f7'; e.target.style.borderColor = '#e8ddd8'; e.target.style.boxShadow = 'none'; }}
              />

              <label style={{ display: 'block', marginBottom: '0.6em', fontWeight: 700, color: '#4a5d52', fontSize: '1em', letterSpacing: '0.02em', fontFamily: '"Playfair Display", serif' }}>Category</label>
              <input
                type="text"
                placeholder="e.g., Storage, Living, Dining, Bedroom"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                style={{ width: '100%', fontSize: '1em', padding: '1em 1.2em', borderRadius: '8px', border: '1px solid #e8ddd8', background: '#faf9f7', color: '#4a5d52', boxSizing: 'border-box', marginBottom: '1.5em', outline: 'none', transition: 'all 0.3s ease', fontFamily: '"Crimson Text", serif', letterSpacing: '0.01em' }}
                onFocus={(e) => { e.target.style.background = '#fff'; e.target.style.borderColor = '#f4a9a8'; e.target.style.boxShadow = '0 0 0 3px rgba(244, 169, 168, 0.1)'; }}
                onBlur={(e) => { e.target.style.background = '#fafafa'; e.target.style.borderColor = '#e0e0e0'; e.target.style.boxShadow = 'none'; }}
              />

              <label style={{ display: 'block', marginBottom: '0.6em', fontWeight: 700, color: '#4a5d52', fontSize: '1em', letterSpacing: '0.02em', fontFamily: '"Playfair Display", serif' }}>Subcategory</label>
              <input
                type="text"
                placeholder="e.g., Wooden Cabinet, Cloth Rack"
                value={form.subcategory}
                onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                style={{ width: '100%', fontSize: '1em', padding: '1em 1.2em', borderRadius: '8px', border: '1px solid #e8ddd8', background: '#faf9f7', color: '#4a5d52', boxSizing: 'border-box', marginBottom: '1.5em', outline: 'none', transition: 'all 0.3s ease', fontFamily: '"Crimson Text", serif', letterSpacing: '0.01em' }}
                onFocus={(e) => { e.target.style.background = '#fff'; e.target.style.borderColor = '#f4a9a8'; e.target.style.boxShadow = '0 0 0 3px rgba(244, 169, 168, 0.1)'; }}
                onBlur={(e) => { e.target.style.background = '#faf9f7'; e.target.style.borderColor = '#e8ddd8'; e.target.style.boxShadow = 'none'; }}
              />

              <label style={{ display: 'block', marginBottom: '0.6em', fontWeight: 700, color: '#4a5d52', fontSize: '1em', letterSpacing: '0.02em', fontFamily: '"Playfair Display", serif' }}>Condition</label>
              <select
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
                style={{ width: '100%', fontSize: '1em', padding: '1em 1.2em', borderRadius: '8px', border: '1px solid #e8ddd8', background: '#faf9f7', color: '#4a5d52', boxSizing: 'border-box', marginBottom: '1.5em', outline: 'none', transition: 'all 0.3s ease', fontFamily: '"Crimson Text", serif', letterSpacing: '0.01em' }}
                onFocus={(e) => { e.target.style.background = '#fff'; e.target.style.borderColor = '#f4a9a8'; e.target.style.boxShadow = '0 0 0 3px rgba(244, 169, 168, 0.1)'; }}
                onBlur={(e) => { e.target.style.background = '#faf9f7'; e.target.style.borderColor = '#e8ddd8'; e.target.style.boxShadow = 'none'; }}
              >
                <option value="">Select condition...</option>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Used">Used</option>
                <option value="Well-Used">Well-Used</option>
              </select>

              <label style={{ display: 'block', marginBottom: '0.6em', fontWeight: 700, color: '#4a5d52', fontSize: '1em', letterSpacing: '0.02em', fontFamily: '"Playfair Display", serif' }}>Price (₱) *</label>
              <input
                type="number"
                placeholder="25000"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                style={{ width: '100%', fontSize: '1em', padding: '1em 1.2em', borderRadius: '8px', border: '1px solid #e8ddd8', background: '#faf9f7', color: '#4a5d52', boxSizing: 'border-box', marginBottom: '1.5em', outline: 'none', transition: 'all 0.3s ease', fontFamily: '"Crimson Text", serif', letterSpacing: '0.01em' }}
                onFocus={(e) => { e.target.style.background = '#fff'; e.target.style.borderColor = '#f4a9a8'; e.target.style.boxShadow = '0 0 0 3px rgba(244, 169, 168, 0.1)'; }}
                onBlur={(e) => { e.target.style.background = '#faf9f7'; e.target.style.borderColor = '#e8ddd8'; e.target.style.boxShadow = 'none'; }}
              />

              <label style={{ display: 'block', marginBottom: '0.6em', fontWeight: 700, color: '#4a5d52', fontSize: '1em', letterSpacing: '0.02em', fontFamily: '"Playfair Display", serif' }}>Description</label>
              <textarea
                placeholder="Share the story of this piece—its craftsmanship, materials, era, condition, and unique characteristics that make it special..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={{ width: '100%', padding: '1em 1.2em', border: '1px solid #e8ddd8', borderRadius: '8px', background: '#faf9f7', color: '#4a5d52', fontSize: '1em', boxSizing: 'border-box', marginBottom: '1.5em', minHeight: '130px', resize: 'vertical', fontFamily: '"Crimson Text", serif', outline: 'none', transition: 'all 0.3s ease', letterSpacing: '0.01em' }}
                onFocus={(e) => { e.target.style.background = '#fff'; e.target.style.borderColor = '#f4a9a8'; e.target.style.boxShadow = '0 0 0 3px rgba(244, 169, 168, 0.1)'; }}
                onBlur={(e) => { e.target.style.background = '#faf9f7'; e.target.style.borderColor = '#e8ddd8'; e.target.style.boxShadow = 'none'; }}
              />

              {/* Images Section */}
              <div style={{ marginTop: '2.5em', paddingTop: '2.5em', borderTop: '1px solid rgba(244, 169, 168, 0.2)' }}>
                <label style={{ display: 'block', marginBottom: '0.25em', fontWeight: 700, color: '#4a5d52', fontSize: '1em', letterSpacing: '0.02em', fontFamily: '"Playfair Display", serif' }}>📸 Product Images</label>
                <p style={{ fontSize: '0.95em', color: '#7a8d84', marginBottom: '1.5em', lineHeight: '1.7em', fontFamily: '"Crimson Text", serif' }}>Upload high-quality photos or paste URLs. Show the craftsmanship and beauty of each piece from multiple angles.</p>

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
                  <p style={{ fontSize: '0.85em', color: '#919499', margin: '1em 0 0 0', lineHeight: '1.5em' }}>PNG, JPG, or GIF • Up to 10 images • Recommended: High quality photos for best display</p>
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
                <details style={{ marginBottom: '0' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#2f333b', padding: '1em 1.2em', background: '#f8f7f5', borderRadius: '8px', fontSize: '0.95em', transition: 'all 0.3s ease', userSelect: 'none' }}>
                    + Paste image URLs (optional)
                  </summary>
                  <div style={{ paddingTop: '1.5em', paddingBottom: '0' }}>
                    <p style={{ fontSize: '0.9em', color: '#919499', marginBottom: '1em' }}>Paste external image URLs (from ibb.co, imgur, etc.)</p>
                    <div style={{ display: 'flex', gap: '0.75em', marginBottom: '1.5em' }}>
                      <input
                        type="text"
                        placeholder="https://i.ibb.co/..."
                        value={imageInput}
                        onChange={(e) => setImageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                        style={{ flex: 1, padding: '0.9em 1.2em', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '1em', background: '#fafafa', color: '#484d55', boxSizing: 'border-box', outline: 'none', transition: 'all 0.3s ease' }}
                        onFocus={(e) => { e.target.style.background = '#fff'; e.target.style.borderColor = '#e97770'; e.target.style.boxShadow = '0 0 0 3px rgba(233, 119, 112, 0.06)'; }}
                        onBlur={(e) => { e.target.style.background = '#fafafa'; e.target.style.borderColor = '#e0e0e0'; e.target.style.boxShadow = 'none'; }}
                      />
                      <button type="button" onClick={handleAddImage} style={{ padding: '0.9em 1.8em', background: '#e97770', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.9em', cursor: 'pointer', transition: 'all 0.3s ease', whiteSpace: 'nowrap' }}
                        onMouseEnter={(e) => { e.target.style.background = '#d95f56'; e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 4px 12px rgba(233, 119, 112, 0.3)'; }}
                        onMouseLeave={(e) => { e.target.style.background = '#e97770'; e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
                      >
                        Add URL
                      </button>
                    </div>

                    {form.imageUrls.length > 0 && (
                      <div>
                        <p style={{ fontSize: '0.9em', fontWeight: 600, color: '#2f333b', marginBottom: '1em' }}>Pasted URLs ({form.imageUrls.length})</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '1.2em' }}>
                          {form.imageUrls.map((url, index) => (
                            <div key={index} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', background: '#f3f3f3', border: '2px solid #919499' }}>
                              <img src={url} alt={`Product ${index + 1}`} style={{ width: '100%', height: '110px', objectFit: 'cover' }} />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(217, 95, 86, 0.95)', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', transition: 'all 0.2s ease' }}
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
                </details>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1.2em', marginTop: '3em', paddingTop: '2.5em', borderTop: '1px solid rgba(244, 169, 168, 0.2)' }}>
                <button type="submit" style={{ flex: 1, padding: '1.2em 2.5em', background: 'linear-gradient(135deg, #f4a9a8, #e8918e)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1.05em', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 8px 20px rgba(244, 169, 168, 0.3)', fontFamily: '"Crimson Text", serif' }}
                  onMouseEnter={(e) => { e.target.style.transform = 'translateY(-4px)'; e.target.style.boxShadow = '0 12px 32px rgba(244, 169, 168, 0.4)'; }}
                  onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 8px 20px rgba(244, 169, 168, 0.3)'; }}
                >
                  {editingId ? '✏️ Update Piece' : '✨ Add to Collection'}
                </button>
                <button type="button" onClick={resetForm} style={{ flex: 1, padding: '1.2em 2.5em', background: 'transparent', color: '#7a8d84', border: '2px solid #d4cac1', borderRadius: '10px', fontSize: '1.05em', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', cursor: 'pointer', transition: 'all 0.3s ease', fontFamily: '"Crimson Text", serif' }}
                  onMouseEnter={(e) => { e.target.style.borderColor = '#7a8d84'; e.target.style.color = '#4a5d52'; e.target.style.background = 'rgba(74, 93, 82, 0.03)'; }}
                  onMouseLeave={(e) => { e.target.style.borderColor = '#d4cac1'; e.target.style.color = '#7a8d84'; e.target.style.background = 'transparent'; }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Bestseller Manager View */}
        {view === 'bestsellers' && (
          <BestsellerManager />
        )}

        {/* Featured Manager View */}
        {view === 'featured' && (
          <FeaturedManager />
        )}

        {/* You May Also Like Manager View */}
        {view === 'youmayalsolike' && (
          <YouMayAlsoLikeManager />
        )}
      </main>
    </div>
  );
}
