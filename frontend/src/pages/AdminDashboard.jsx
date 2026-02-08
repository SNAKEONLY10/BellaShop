import React, { useEffect, useState } from 'react';
import apiClient from '../api/client.js';
import FeaturedManager from './FeaturedManager';
import BestsellerManager from './BestsellerManager';
import YouMayAlsoLikeManager from './YouMayAlsoLikeManager';
import DescriptionPoolsEditor from '../components/DescriptionPoolsEditor';

export default function AdminDashboard() {
  const [view, setView] = useState('inventory');
  const [products, setProducts] = useState([]);
  const [soldProducts, setSoldProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, available: 0, sold: 0 });
  const [editingId, setEditingId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortOption, setSortOption] = useState('default');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [form, setForm] = useState({
    name: '',
    category: '',
    price: '',
    subcategory: '',
    condition: '',
    conditionDetails: '',
    description: '',
    length: '',
    width: '',
    height: '',
  });
  
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch sold products when view changes to 'sold'
  useEffect(() => {
    if (view === 'sold') {
      fetchSoldProducts();
    }
  }, [view]);

  // autocomplete suggestions for admin search (names + categories)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setSelectedSuggestionIndex(-1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const q = (debouncedSearchTerm || '').trim().toLowerCase();
    if (!q) {
      setSuggestions([]);
      return;
    }
    const items = [];
    products.forEach((p) => {
      if (p.name) items.push(p.name);
      if (p.category) items.push(p.category);
    });
    const uniq = [...new Set(items.map(s => s.trim()).filter(Boolean))];
    const matched = uniq.filter(s => s.toLowerCase().startsWith(q)).slice(0, 8);
    setSuggestions(matched);
  }, [debouncedSearchTerm, products]);

  // keyboard navigation for search suggestions
  const handleSearchKeyDown = (e) => {
    if (suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      setSearchTerm(suggestions[selectedSuggestionIndex]);
      setSuggestions([]);
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      setSelectedSuggestionIndex(-1);
    }
  };

  // compute filtered + sorted products for inventory display
  const displayedProducts = products
    .filter((p) => {
      const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
      if (!debouncedSearchTerm) return matchesCategory;
      const q = debouncedSearchTerm.toLowerCase();
      const name = (p.name || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      return matchesCategory && (name.includes(q) || cat.includes(q));
    })
    .slice() // copy before sort
    .sort((a, b) => {
      if (sortOption === 'price-asc') return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (sortOption === 'price-desc') return (Number(b.price) || 0) - (Number(a.price) || 0);
      return 0;
    });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/products');
      const productsData = Array.isArray(res.data) ? res.data : [];
      setProducts(productsData);
      // Extract unique categories
      const uniqueCats = [...new Set(productsData.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCats.sort());
      
      // Fetch stats
      try {
        const statsRes = await apiClient.get('/api/products/stats/overview', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(statsRes.data);
      } catch (statsErr) {
        console.error('Error fetching stats:', statsErr);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Sentence pools for rule-based auto description (free, local)
  const sentencePools = {
    sofa: [
      'Designed for comfortable seating and relaxation.',
      'Ideal for living rooms and family areas.',
      'Upholstered finish for an inviting look and feel.'
    ],
    wardrobe: [
      'Provides organized storage for clothes and household items.',
      'Helps keep your space tidy and clutter-free.',
      'Built for durability and everyday use.'
    ],
    cabinet: [
      'Provides organized storage for clothes and household items.',
      'Helps keep your space tidy and clutter-free.',
      'Compact design suitable for various room layouts.'
    ],
    kitchen: [
      'Suitable for kitchen use and daily food preparation.',
      'Practical item for household kitchen needs.',
      'Easy to clean and maintain for busy kitchens.'
    ],
    appliance: [
      'Designed to support airflow and ventilation.',
      'Useful appliance for everyday comfort.',
      'Energy-efficient design for cost savings.'
    ],
    divider: [
      'Functional piece suitable for home or shop use.',
      'Can be used for display or space separation.',
      'Adds structure while maintaining visual appeal.'
    ],
    display: [
      'Functional piece suitable for home or shop use.',
      'Can be used for display or space separation.',
      'Designed to showcase items attractively.'
    ]
  };

  // Shuffle helper
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Choose pool by category name heuristics
  const pickPool = (category) => {
    if (!category) return [];
    const c = category.toLowerCase();
    if (c.includes('sofa')) return sentencePools.sofa;
    if (c.includes('wardrobe')) return sentencePools.wardrobe;
    if (c.includes('cabinet')) return sentencePools.cabinet;
    if (c.includes('kitchen') || c.includes('teapot') || c.includes('kitchen')) return sentencePools.kitchen;
    if (c.includes('fan') || c.includes('appliance') || c.includes('electric')) return sentencePools.appliance;
    if (c.includes('divider') || c.includes('display')) return sentencePools.divider;
    // fallback: try to map common words
    for (const key of Object.keys(sentencePools)) {
      if (c.includes(key)) return sentencePools[key];
    }
    return [];
  };

  // Generate description rule-based (no external APIs)
  // New behavior: produce 2–3 sentences that include condition, material/build, style, size/features, and purpose/benefit.
  // Avoid repeating the product name; prefer natural, informative phrasing.
  const generateDescription = () => {
    const cond = (form.condition || '').trim();
    const details = (form.conditionDetails || '').trim();
    const pool = pickPool(form.category || '');
    const shuffled = shuffle(pool);

    // Helpers to extract material/style/feature hints from short inputs
    const inferMaterial = () => {
      // try conditionDetails then subcategory then name
      const src = (details || form.subcategory || form.name || '').toLowerCase();
      if (!src) return '';
      if (src.includes('wood')) return 'solid wood';
      if (src.includes('metal')) return 'metal';
      if (src.includes('steel')) return 'stainless steel';
      if (src.includes('rattan')) return 'rattan';
      if (src.includes('fabric') || src.includes('upholstered')) return 'fabric-upholstered';
      if (src.includes('leather')) return 'leather';
      return ''; 
    };

    const inferStyle = () => {
      const c = (form.category || '').toLowerCase();
      if (c.includes('sofa') || c.includes('couch')) return 'comfort-focused';
      if (c.includes('wardrobe') || c.includes('cabinet')) return 'classic';
      if (c.includes('kitchen') || c.includes('appliance')) return 'practical';
      return '';
    };

    const material = inferMaterial();
    const styleHint = inferStyle();

    // Build sentences: target 2 sentences (3rd optional)
    const parts = [];

    // Sentence 1: integrate condition subtly (not as its own sentence), then material/style and a leading pool sentence
    const firstFragments = [];
    let prefix = '';
    if (cond) {
      // Integrate condition as a clause rather than a standalone sentence
      prefix = cond === 'New' || cond.toLowerCase().includes('new') ? 'Brand new' : `In ${cond} condition`;
    }
    if (prefix) prefix = prefix + ', ';
    if (material) firstFragments.push(material);
    if (styleHint) firstFragments.push(styleHint);
    // use a strong pool sentence fragment if available
    if (shuffled.length > 0) firstFragments.push(shuffled[0]);
    let sentence1 = (prefix + firstFragments.join(' ')).replace(/\s+/g, ' ').trim();
    if (sentence1) parts.push(sentence1.endsWith('.') ? sentence1 : sentence1 + '.');

    // Sentence 2: size/features + purpose/benefit (try to extract length/width/height or features in details)
    const sizeParts = [];
    if (form.length || form.width || form.height) {
      const dims = [];
      if (form.length) dims.push(`L ${form.length}`);
      if (form.width) dims.push(`W ${form.width}`);
      if (form.height) dims.push(`H ${form.height}`);
      sizeParts.push(`Dimensions: ${dims.join(' × ')}.`);
    }
    if (details) {
      // Shorten details into one clause
      const short = details.length > 120 ? details.slice(0, 117).trim() + '...' : details;
      sizeParts.push(short.charAt(0).toUpperCase() + short.slice(1) + (short.endsWith('.') ? '' : '.'));
    }

    // Purpose/benefit: choose a category-appropriate benefit
    const benefitMapping = (category) => {
      const c = (category || '').toLowerCase();
      if (c.includes('bike') || c.includes('bicycle') || c.includes('e-bike') || c.includes('electric')) return 'Perfect for commuting, offering efficient and eco-friendly transport.';
      if (c.includes('sofa') || c.includes('couch')) return 'Great for relaxing and hosting guests with comfort.';
      if (c.includes('wardrobe') || c.includes('cabinet')) return 'Helps keep your home organized while saving space.';
      if (c.includes('kitchen') || c.includes('appliance')) return 'Built for practical daily use in busy kitchens.';
      if (c.includes('table') || c.includes('desk')) return 'Versatile for work or dining, fitting many room layouts.';
      if (c.includes('display') || c.includes('divider')) return 'Ideal for display or partitioning, combining function with style.';
      return shuffled.length > 1 ? shuffled[1] : 'Ideal for practical everyday use.';
    };
    const benefit = benefitMapping(form.category);

    const sentence2 = (sizeParts.join(' ') + ' ' + benefit).trim();
    if (sentence2) parts.push(sentence2.endsWith('.') ? sentence2 : sentence2 + '.');

    // Optional third polished closer with low probability
    if (Math.random() < 0.25) {
      const closers = [
        'A tasteful, long-lasting choice for mindful living.',
        'Built to last and designed to delight.'
      ];
      parts.push(closers[Math.floor(Math.random() * closers.length)]);
    }

    const description = parts.join(' ');
    setForm(prev => ({ ...prev, description }));
  };

  const fetchSoldProducts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/products/sold/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const soldData = Array.isArray(res.data) ? res.data : [];
      setSoldProducts(soldData);
    } catch (err) {
      console.error('Error fetching sold products:', err);
      setSoldProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ name: '', category: '', price: '', condition: '', conditionDetails: '', description: '' });
    setImageFiles([]);
    setImagePreviews([]);
    setEditingId(null);
  };

  const handleAddNewCategory = () => {
    if (newCategoryInput.trim() && !categories.includes(newCategoryInput.trim())) {
      const newCat = newCategoryInput.trim();
      setCategories([...categories, newCat].sort());
      setForm({ ...form, category: newCat });
      setNewCategoryInput('');
      setShowNewCategoryInput(false);
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

  const submitProduct = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      alert('Name and price are required');
      return;
    }
    
    if (imageFiles.length === 0) {
      alert('Please upload at least one product image');
      return;
    }

    try {
      console.log('🚀 Submitting product...');
      console.log('Form data:', form);
      console.log('Image files:', imageFiles);
      console.log('Token available:', !!token);
      
      let axiosConfig = { headers: { Authorization: `Bearer ${token}` } };
      
      // Always use FormData for file uploads
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('category', form.category);
      formData.append('price', form.price);
      formData.append('subcategory', form.subcategory || '');
      formData.append('condition', form.condition || '');
      // Do NOT duplicate condition details inside the description.
      // Send description and conditionDetails separately so condition is stored in its own DB column.
      formData.append('description', form.description || '');
      formData.append('conditionDetails', form.conditionDetails || '');
      formData.append('length', form.length || '');
      formData.append('width', form.width || '');
      formData.append('height', form.height || '');

      // Add uploaded files
      console.log('📸 Adding', imageFiles.length, 'image files...');
      if (imageFiles.length > 0) {
        imageFiles.forEach((file, idx) => {
          console.log(`  File ${idx + 1}:`, file.name, file.size, 'bytes');
          formData.append('images', file);
        });
      }

      console.log('📤 Sending request...');
      if (editingId) {
        // Update product
        const response = await apiClient.put(`/api/products/${editingId}`, formData, {
          headers: { ...axiosConfig.headers, 'Content-Type': 'multipart/form-data' },
        });
        console.log('✅ Product updated:', response.data);
        alert('Product updated successfully!');
      } else {
        // Create product
        const response = await apiClient.post('/api/products', formData, {
          headers: { ...axiosConfig.headers, 'Content-Type': 'multipart/form-data' },
        });
        console.log('✅ Product created:', response.data);
        alert('Product added successfully!');
      }
      resetForm();
      await fetchProducts();
      setView('inventory');
    } catch (err) {
      console.error('❌ Error submitting product:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        data: err.response?.data,
        fullError: err
      });
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const deleteProduct = async (id) => {
    console.log('🗑️ Delete clicked. Token:', token ? 'EXISTS' : 'MISSING');
    if (!window.confirm('Are you sure you want to delete?')) {
      console.log('❌ Delete cancelled by user');
      return;
    }
    try {
      console.log('📤 Sending DELETE to /api/products/' + id);
      const response = await apiClient.delete(`/api/products/${id}`, {
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

  const toggleSold = async (id) => {
    try {
      await apiClient.patch(`/api/products/${id}/toggle-sold`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert('Product sold status updated');
      await fetchProducts();
    } catch (err) {
      console.error('Error toggling sold status:', err);
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const toggleBestSeller = async (id) => {
    try {
      const response = await apiClient.patch(`/api/products/${id}/toggle-bestseller`, {}, {
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
      conditionDetails: product.conditionDetails || '',
      description: product.description || '',
      length: product.length || '',
      width: product.width || '',
      height: product.height || '',
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
            { id: 'sold', label: '✓ Sold Items', icon: '✓' },
            { id: 'add', label: '✨ Add New', icon: '✨' },
            { id: 'bestsellers', label: '🏆 6 Bestsellers', icon: '🏆' },
            { id: 'featured', label: '✨ Featured Slider', icon: '✨' },
            { id: 'youmayalsolike', label: '🌸 You May Also Like', icon: '🌸' },
            { id: 'settings', label: '⚙️ Settings', icon: '⚙️' },
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
          {view === 'settings' && (
            <div>
              <div style={{ marginBottom: '2.5em' }}>
                <p style={{ fontSize: '0.85em', color: '#f4a9a8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5em', fontFamily: '"Crimson Text", serif' }}>Settings</p>
              </div>
              <DescriptionPoolsEditor />
            </div>
          )}

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

            {/* Quick Stats */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5em' }}>
              <div style={{ padding: '0.8em 1em', background: '#fff', borderRadius: '8px', border: '1px solid rgba(74,93,82,0.06)' }}>
                <div style={{ fontSize: '0.85em', color: '#7a8d84' }}>Total</div>
                <div style={{ fontSize: '1.2em', fontWeight: 800, color: '#4a5d52' }}>{stats.total}</div>
              </div>
              <div style={{ padding: '0.8em 1em', background: '#fff', borderRadius: '8px', border: '1px solid rgba(74,93,82,0.06)' }}>
                <div style={{ fontSize: '0.85em', color: '#7a8d84' }}>Available</div>
                <div style={{ fontSize: '1.2em', fontWeight: 800, color: '#4a5d52' }}>{stats.available}</div>
              </div>
              <div style={{ padding: '0.8em 1em', background: '#fff', borderRadius: '8px', border: '1px solid rgba(74,93,82,0.06)' }}>
                <div style={{ fontSize: '0.85em', color: '#7a8d84' }}>Sold</div>
                <div style={{ fontSize: '1.2em', fontWeight: 800, color: '#4a5d52' }}>{stats.sold}</div>
              </div>
            </div>

            {/* Category filter + Sort controls */}
            {categories.length > 0 && (
              <div style={{ marginBottom: '1.2em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1em', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '0.6em', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    style={{ padding: '0.5em 1em', background: selectedCategory === null ? 'linear-gradient(135deg, #f4a9a8, #e8918e)' : 'rgba(74, 93, 82, 0.06)', color: selectedCategory === null ? '#fff' : '#4a5d52', border: 'none', borderRadius: '18px', fontWeight: 700, fontSize: '0.85em', cursor: 'pointer' }}
                  >All Items</button>
                  {categories.map((cat) => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} style={{ padding: '0.5em 1em', background: selectedCategory === cat ? 'linear-gradient(135deg, #f4a9a8, #e8918e)' : 'rgba(74, 93, 82, 0.06)', color: selectedCategory === cat ? '#fff' : '#4a5d52', border: 'none', borderRadius: '18px', fontWeight: 700, fontSize: '0.85em', cursor: 'pointer', textTransform: 'capitalize' }}>{cat}</button>
                  ))}
                  <div style={{ position: 'relative' }}>
                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      placeholder="Search products..."
                      style={{ padding: '0.6em 0.9em', borderRadius: '10px', border: '1px solid #e8ddd8', background: '#faf9f7', color: '#4a5d52', fontFamily: '"Crimson Text", serif', minWidth: '220px', marginLeft: '0.6em' }}
                    />
                    {suggestions.length > 0 && (
                      <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '10px', boxShadow: '0 8px 20px rgba(74,93,82,0.08)', zIndex: 60, overflow: 'hidden' }}>
                        {suggestions.map((s, idx) => (
                          <div key={s} onMouseDown={() => { setSearchTerm(s); setSuggestions([]); }} onMouseEnter={() => setSelectedSuggestionIndex(idx)} style={{ padding: '0.6em 0.9em', cursor: 'pointer', borderBottom: '1px solid rgba(0,0,0,0.03)', fontFamily: '"Crimson Text", serif', color: selectedSuggestionIndex === idx ? '#fff' : '#4a5d52', background: selectedSuggestionIndex === idx ? 'linear-gradient(135deg, #f4a9a8, #e8918e)' : 'transparent' }}>
                            {s}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6em' }}>
                  <label style={{ color: '#7a8d84', fontWeight: 700, fontSize: '0.85em' }}>Sort</label>
                  <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} style={{ padding: '0.6em 0.8em', borderRadius: '8px', border: '1px solid #e8ddd8', background: '#fff', fontSize: '0.95em' }}>
                    <option value="default">Default</option>
                    <option value="price-asc">Price: Low → High</option>
                    <option value="price-desc">Price: High → Low</option>
                  </select>
                </div>
              </div>
            )}

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
            ) : displayedProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4em 2em', background: 'rgba(244, 169, 168, 0.04)', borderRadius: '12px', marginTop: '1em' }}>
                <p style={{ color: '#7a8d84', fontSize: '1.1em', marginBottom: '1em' }}>🔍 No items found in <strong>{selectedCategory}</strong></p>
                <button onClick={() => setSelectedCategory(null)} style={{ padding: '0.7em 1.6em', background: 'linear-gradient(135deg, #f4a9a8, #e8918e)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>View all items</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2.5em', marginTop: '2em' }}>
                {displayedProducts.map((product) => (
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
                    <p style={{ fontSize: '0.85em', color: '#a8bbb2', marginBottom: '0.5em', fontFamily: '"Crimson Text", serif' }}>📸 {product.imageUrls?.length || 0} image{product.imageUrls?.length !== 1 ? 's' : ''}</p>
                    <p style={{ fontSize: '0.8em', color: '#a8bbb2', marginBottom: '1.3em', fontFamily: '"Crimson Text", serif' }}>Posted {product.createdAt ? new Date(product.createdAt).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : 'N/A'}</p>
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
                      <button onClick={() => toggleSold(product.id)} style={{ flex: '1 1 auto', minWidth: '100px', padding: '0.8em 1.2em', background: product.status === 'Sold' ? 'rgba(107,112,128,0.12)' : 'linear-gradient(135deg, #4a5d52, #3d4f47)', color: product.status === 'Sold' ? '#6b7280' : '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.85em', cursor: 'pointer', transition: 'all 0.3s ease', fontFamily: '"Crimson Text", serif' }}
                        onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 4px 12px rgba(74,93,82,0.12)'; }}
                        onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
                      >
                        {product.status === 'Sold' ? 'Mark Available' : 'Mark Sold'}
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

        {/* Sold Items View */}
        {view === 'sold' && (
          <div>
            <div style={{ marginBottom: '2.5em' }}>
              <p style={{ fontSize: '0.85em', color: '#f4a9a8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5em', fontFamily: '"Crimson Text", serif' }}>✓ Sold Items</p>
              <h2 style={{ margin: 0, fontSize: '2.2em', color: '#3d5247', fontFamily: '"Playfair Display", serif', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Recently Sold ({soldProducts.length})
              </h2>
              <p style={{ margin: '0.8em 0 0 0', color: '#7a8d84', fontSize: '0.95em', lineHeight: '1.6em' }}>
                Items marked as sold. These will be automatically removed 1 month after being sold.
              </p>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3em', color: '#7a8d84' }}>Loading sold items...</div>
            ) : soldProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3em', color: '#7a8d84' }}>No sold items yet</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2em' }}>
                {soldProducts.map((product) => (
                  <div key={product.id} style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(244, 169, 168, 0.12)', transition: 'all 0.3s ease' }}>
                    {/* Product Image */}
                    <div style={{ position: 'relative', height: '200px', overflow: 'hidden', background: '#f5f0f0' }}>
                      <img 
                        src={product.imageUrls?.[0] || 'https://via.placeholder.com/300x200'} 
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{ position: 'absolute', top: '0.8em', right: '0.8em', padding: '0.4em 0.8em', background: '#6b7280', color: '#fff', borderRadius: '6px', fontSize: '0.75em', fontWeight: 700 }}>
                        SOLD
                      </div>
                    </div>

                    {/* Product Info */}
                    <div style={{ padding: '1.5em' }}>
                      <h3 style={{ margin: '0 0 0.5em 0', fontSize: '1.1em', color: '#3d5247', fontWeight: 700 }}>
                        {product.name}
                      </h3>
                      
                      <p style={{ margin: '0.5em 0', fontSize: '0.9em', color: '#7a8d84' }}>
                        <strong style={{ color: '#f4a9a8' }}>₱{product.price?.toLocaleString() || 'N/A'}</strong>
                      </p>

                      {product.category && (
                        <p style={{ margin: '0.5em 0', fontSize: '0.85em', color: '#7a8d84' }}>
                          📌 {product.category}
                        </p>
                      )}

                      {/* Sold Date */}
                      {product.soldAt && (
                        <p style={{ margin: '0.8em 0 0 0', paddingTop: '0.8em', borderTop: '1px solid rgba(244, 169, 168, 0.2)', fontSize: '0.85em', color: '#f4a9a8', fontWeight: 700 }}>
                          Sold {new Date(product.soldAt).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}
                        </p>
                      )}

                      {/* Restore Button */}
                      <button 
                        onClick={async () => {
                          try {
                            await apiClient.patch(`/api/products/${product.id}/toggle-sold`, {}, {
                              headers: { Authorization: `Bearer ${token}` }
                            });
                            fetchSoldProducts();
                            fetchProducts();
                          } catch (err) {
                            console.error('Error restoring product:', err);
                          }
                        }}
                        style={{ 
                          marginTop: '1em', 
                          width: '100%', 
                          padding: '0.8em', 
                          background: 'linear-gradient(135deg, #f4a9a8, #e8918e)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.85em',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'linear-gradient(135deg, #e8918e, #dd7a76)';
                          e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'linear-gradient(135deg, #f4a9a8, #e8918e)';
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        ↺ Restore to Available
                      </button>
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
              <div style={{ display: 'flex', gap: '0.75em', marginBottom: '1.5em', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    list="categories-list"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="Select or type category..."
                    title={form.category || ''}
                    style={{
                      width: '100%',
                      fontSize: '1em',
                      lineHeight: '1.4em',
                      height: '48px',
                      padding: '0.8em 1.2em',
                      borderRadius: '8px',
                      border: '1px solid #e8ddd8',
                      background: '#fff',
                      color: '#2f333b',
                      boxSizing: 'border-box',
                      outline: 'none',
                      transition: 'all 0.15s ease',
                      fontFamily: '"Crimson Text", serif',
                      letterSpacing: '0.01em',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#f4a9a8'; e.target.style.boxShadow = '0 0 0 3px rgba(244,169,168,0.07)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e8ddd8'; e.target.style.boxShadow = 'none'; }}
                  />
                  <datalist id="categories-list">
                    {categories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewCategoryInput(true)}
                  style={{ padding: '0.9em 1.2em', background: '#f4a9a8', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >+ Add</button>
              </div>

              {showNewCategoryInput && (
                <div style={{ display: 'flex', gap: '0.75em', marginTop: '-1em', marginBottom: '1.5em' }}>
                  <input
                    type="text"
                    placeholder="Enter new category (e.g., Sofa, Cabinet, Bed)"
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddNewCategory()}
                    autoFocus
                    style={{ flex: 1, fontSize: '1em', padding: '1em 1.2em', borderRadius: '8px', border: '1px solid #f4a9a8', background: '#fff', color: '#4a5d52', boxSizing: 'border-box', outline: 'none', boxShadow: '0 0 0 3px rgba(244, 169, 168, 0.1)', transition: 'all 0.3s ease', fontFamily: '"Crimson Text", serif', letterSpacing: '0.01em' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddNewCategory}
                    style={{ padding: '0.9em 1.8em', background: '#f4a9a8', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.9em', cursor: 'pointer', transition: 'all 0.3s ease', whiteSpace: 'nowrap', fontFamily: '"Crimson Text", serif' }}
                    onMouseEnter={(e) => { e.target.style.background = '#e8918e'; e.target.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { e.target.style.background = '#f4a9a8'; e.target.style.transform = 'translateY(0)'; }}
                  >
                    ✓ Add
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowNewCategoryInput(false); setNewCategoryInput(''); }}
                    style={{ padding: '0.9em 1.2em', background: 'transparent', color: '#7a8d84', border: '1px solid #d4cac1', borderRadius: '6px', fontWeight: 500, fontSize: '0.9em', cursor: 'pointer', transition: 'all 0.3s ease', fontFamily: '"Crimson Text", serif' }}
                    onMouseEnter={(e) => { e.target.style.borderColor = '#7a8d84'; }}
                    onMouseLeave={(e) => { e.target.style.borderColor = '#d4cac1'; }}
                  >
                    ✕ Cancel
                  </button>
                </div>
              )}

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
              <div style={{ marginBottom: '1.5em' }}>
                <input
                  list="condition-list"
                  value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value })}
                  placeholder="Select or type condition..."
                  title={form.condition || ''}
                  style={{
                    width: '100%',
                    fontSize: '1em',
                    lineHeight: '1.4em',
                    height: '48px',
                    padding: '0.8em 1.2em',
                    borderRadius: '8px',
                    border: '1px solid #e8ddd8',
                    background: '#fff',
                    color: '#2f333b',
                    boxSizing: 'border-box',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                    fontFamily: '"Crimson Text", serif',
                    letterSpacing: '0.01em',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#f4a9a8'; e.target.style.boxShadow = '0 0 0 3px rgba(244,169,168,0.07)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e8ddd8'; e.target.style.boxShadow = 'none'; }}
                />
                <datalist id="condition-list">
                  <option value="New" />
                  <option value="Like New" />
                  <option value="Used" />
                  <option value="Well-Used" />
                </datalist>
              </div>

              <label style={{ display: 'block', marginTop: '0.6em', marginBottom: '0.4em', fontWeight: 700, color: '#4a5d52', fontSize: '0.95em' }}>Condition Details (optional)</label>
              <input
                type="text"
                placeholder="e.g., small scratches at the back"
                value={form.conditionDetails}
                onChange={(e) => setForm({ ...form, conditionDetails: e.target.value })}
                style={{ width: '100%', fontSize: '0.95em', padding: '0.8em 1em', borderRadius: '8px', border: '1px solid #e8ddd8', background: '#faf9f7', color: '#4a5d52', boxSizing: 'border-box', marginBottom: '1.2em', outline: 'none' }}
              />

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

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ display: 'block', marginBottom: '0.6em', fontWeight: 700, color: '#4a5d52', fontSize: '1em', letterSpacing: '0.02em', fontFamily: '"Playfair Display", serif' }}>Description</label>
                <button
                  type="button"
                  onClick={generateDescription}
                  style={{ background: 'transparent', border: '1px solid rgba(68,93,82,0.08)', padding: '0.4em 0.6em', borderRadius: 8, cursor: 'pointer', color: '#3d5247', fontWeight: 700, fontSize: '0.85em' }}
                >Auto-Generate</button>
              </div>
              <textarea
                placeholder="Share the story of this piece—its craftsmanship, materials, era, condition, and unique characteristics that make it special..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={{ width: '100%', padding: '1em 1.2em', border: '1px solid #e8ddd8', borderRadius: '8px', background: '#faf9f7', color: '#4a5d52', fontSize: '1em', boxSizing: 'border-box', marginBottom: '1.5em', minHeight: '130px', resize: 'vertical', fontFamily: '"Crimson Text", serif', outline: 'none', transition: 'all 0.3s ease', letterSpacing: '0.01em' }}
                onFocus={(e) => { e.target.style.background = '#fff'; e.target.style.borderColor = '#f4a9a8'; e.target.style.boxShadow = '0 0 0 3px rgba(244, 169, 168, 0.1)'; }}
                onBlur={(e) => { e.target.style.background = '#faf9f7'; e.target.style.borderColor = '#e8ddd8'; e.target.style.boxShadow = 'none'; }}
              />

              {/* Dimensions Inputs L / W / H */}
              <div style={{ display: 'flex', gap: '0.8em', marginBottom: '1.5em', alignItems: 'center' }}>
                <div style={{ flex: '1 1 33%' }}>
                  <label style={{ display: 'block', marginBottom: '0.4em', fontWeight: 700, color: '#4a5d52', fontSize: '0.95em' }}>L</label>
                  <input type="number" placeholder="Length" value={form.length} onChange={(e) => setForm({ ...form, length: e.target.value })} style={{ width: '100%', padding: '0.8em', borderRadius: '8px', border: '1px solid #e8ddd8' }} />
                </div>
                <div style={{ flex: '1 1 33%' }}>
                  <label style={{ display: 'block', marginBottom: '0.4em', fontWeight: 700, color: '#4a5d52', fontSize: '0.95em' }}>W</label>
                  <input type="number" placeholder="Width" value={form.width} onChange={(e) => setForm({ ...form, width: e.target.value })} style={{ width: '100%', padding: '0.8em', borderRadius: '8px', border: '1px solid #e8ddd8' }} />
                </div>
                <div style={{ flex: '1 1 33%' }}>
                  <label style={{ display: 'block', marginBottom: '0.4em', fontWeight: 700, color: '#4a5d52', fontSize: '0.95em' }}>H</label>
                  <input type="number" placeholder="Height" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} style={{ width: '100%', padding: '0.8em', borderRadius: '8px', border: '1px solid #e8ddd8' }} />
                </div>
              </div>

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
