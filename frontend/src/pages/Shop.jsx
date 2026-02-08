import React, { useEffect, useState } from 'react';
import apiClient from '../api/client.js';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoginModal from '../components/LoginModal';
import ProductModal from '../components/ProductModal';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortOption, setSortOption] = useState('default');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [openLogin, setOpenLogin] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);



  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/products');
      const productsData = Array.isArray(res.data) ? res.data : [];
      setProducts(productsData);
      // Extract unique categories
      const uniqueCats = [...new Set(productsData.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCats.sort());
      setSelectedCategory(null); // Reset filter when loading
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Scroll fade-in animation
  useEffect(() => {
    const items = document.querySelectorAll('[data-fade]');
    if (!items.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    items.forEach((el) => {
      el.classList.add('fade-hidden');
      obs.observe(el);
    });
    return () => obs.disconnect();
  }, [products]);

  // debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setSelectedSuggestionIndex(-1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // build autocomplete suggestions from product names + categories
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

  // keyboard navigation for suggestions
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

  const displayedProducts = products
    .filter(p => {
      // Hide sold items on Shop
      if (p.status === 'Sold') return false;
      const inCategory = selectedCategory ? p.category === selectedCategory : true;
      if (!debouncedSearchTerm) return inCategory;
      const q = debouncedSearchTerm.toLowerCase();
      return inCategory && ((p.name || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q));
    })
    .slice()
    .sort((a, b) => {
      if (sortOption === 'price-asc') return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (sortOption === 'price-desc') return (Number(b.price) || 0) - (Number(a.price) || 0);
      return 0;
    });

  const openGallery = (product) => {
    setSelectedProduct(product);
    setCurrentImageIndex(0);
  };

  const closeGallery = () => {
    setSelectedProduct(null);
  };

  const setIndex = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <div id="page-wrapper">
      <Header onAdminClick={() => setOpenLogin(true)} />

      {/* Shop Header */}
      <section style={{ paddingTop: '8em', background: 'linear-gradient(135deg, #faf9f7 0%, #f5f3f0 100%)', padding: '8em 0 4em 0', borderBottom: '2px solid rgba(244, 169, 168, 0.15)' }}>
        <div className="container" style={{ maxWidth: '68em', margin: '0 auto', padding: '0 2em' }}>
          <header style={{ textAlign: 'center', marginBottom: '3em' }}>
            <p style={{ fontSize: '0.9em', color: '#f4a9a8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.8em', fontFamily: '"Crimson Text", serif' }}>🛋️ Our Full Collection</p>
            <h1 style={{ fontSize: '3.2em', color: '#4a5d52', fontWeight: 800, marginBottom: '0.5em', fontFamily: '"Playfair Display", serif', letterSpacing: '-0.02em' }}>
              KIMM'S Collection
            </h1>
            <p style={{ fontSize: '1.15em', color: '#7a8d84', letterSpacing: '0.05em', fontFamily: '"Crimson Text", serif', maxWidth: '600px', margin: '0.5em auto 0' }}>
              Discover carefully selected premium Japanese furniture pieces for every room, every style, and every story
            </p>
          </header>
        </div>
      </section>

      {/* Products Grid */}
      <section style={{ background: 'linear-gradient(135deg, #faf9f7 0%, #f5f3f0 100%)', padding: '3em 0 9em 0' }}>
        <div className="container" style={{ maxWidth: '68em', margin: '0 auto', padding: '0 2em' }}>
          {/* Category Filter */}
          {categories.length > 0 && (
            <div style={{ marginBottom: '3em', paddingBottom: '2em', borderBottom: '2px solid rgba(244, 169, 168, 0.15)' }}>
              <p style={{ fontSize: '0.9em', color: '#f4a9a8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.2em', fontFamily: '"Crimson Text", serif' }}>📂 Filter by Category</p>
              <div style={{ display: 'flex', gap: '0.8em', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.8em', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setSelectedCategory(null)}
                  style={{
                    padding: '0.7em 1.8em',
                    background: selectedCategory === null ? 'linear-gradient(135deg, #f4a9a8, #e8918e)' : 'rgba(74, 93, 82, 0.08)',
                    color: selectedCategory === null ? '#fff' : '#4a5d52',
                    border: 'none',
                    borderRadius: '25px',
                    fontWeight: 700,
                    fontSize: '0.9em',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontFamily: '"Crimson Text", serif',
                    textTransform: 'capitalize',
                    letterSpacing: '0.05em',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== null) {
                      e.target.style.background = 'rgba(74, 93, 82, 0.15)';
                      e.target.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== null) {
                      e.target.style.background = 'rgba(74, 93, 82, 0.08)';
                      e.target.style.transform = 'scale(1)';
                    }
                  }}
                >
                  All Items
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    style={{
                      padding: '0.7em 1.8em',
                      background: selectedCategory === category ? 'linear-gradient(135deg, #f4a9a8, #e8918e)' : 'rgba(74, 93, 82, 0.08)',
                      color: selectedCategory === category ? '#fff' : '#4a5d52',
                      border: 'none',
                      borderRadius: '25px',
                      fontWeight: 700,
                      fontSize: '0.9em',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      fontFamily: '"Crimson Text", serif',
                      textTransform: 'capitalize',
                      letterSpacing: '0.05em',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedCategory !== category) {
                        e.target.style.background = 'rgba(74, 93, 82, 0.15)';
                        e.target.style.transform = 'scale(1.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedCategory !== category) {
                        e.target.style.background = 'rgba(74, 93, 82, 0.08)';
                        e.target.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    {category}
                  </button>
                ))}
                </div>

                <div style={{ display: 'flex', gap: '0.8em', alignItems: 'center', marginLeft: 'auto' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      placeholder="Search products..."
                      style={{ padding: '0.6em 1em', borderRadius: '10px', border: '1px solid #e8ddd8', background: '#faf9f7', color: '#4a5d52', fontFamily: '"Crimson Text", serif', minWidth: '220px' }}
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
                  <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} style={{ padding: '0.6em 0.9em', borderRadius: '8px', border: '1px solid #e8ddd8', background: 'linear-gradient(135deg, #fff, #fbf9f7)', fontSize: '0.95em', color: '#4a5d52', fontFamily: '"Crimson Text", serif' }}>
                    <option value="default">Sort: Default</option>
                    <option value="price-asc">Price: Low → High</option>
                    <option value="price-desc">Price: High → Low</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Filtered Products Count */}
          {selectedCategory && (
            <p style={{ fontSize: '0.95em', color: '#7a8d84', marginBottom: '1.5em', fontFamily: '"Crimson Text", serif' }}>
              📦 Showing {products.filter(p => p.category === selectedCategory).length} item{products.filter(p => p.category === selectedCategory).length !== 1 ? 's' : ''} in <strong>{selectedCategory}</strong>
            </p>
          )}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '6em 0', color: '#7a8d84', fontSize: '1.15em', fontFamily: '"Crimson Text", serif' }}>
              ✨ Loading our collection...
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '6em 2em', backgroundColor: 'rgba(244, 169, 168, 0.08)', borderRadius: '12px', border: '2px dashed rgba(244, 169, 168, 0.3)' }}>
              <p style={{ color: '#7a8d84', fontSize: '1.15em', fontFamily: '"Crimson Text", serif', marginBottom: '1em' }}>✨ Collection coming soon</p>
              <p style={{ color: '#a8bbb2', fontSize: '1em', fontFamily: '"Crimson Text", serif' }}>Check back soon for new premium pieces</p>
            </div>
          ) : products.filter(p => selectedCategory ? p.category === selectedCategory : true).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '6em 2em', backgroundColor: 'rgba(244, 169, 168, 0.08)', borderRadius: '12px', border: '2px dashed rgba(244, 169, 168, 0.3)' }}>
              <p style={{ color: '#7a8d84', fontSize: '1.15em', fontFamily: '"Crimson Text", serif', marginBottom: '1em' }}>🔍 No items found in {selectedCategory}</p>
              <button onClick={() => setSelectedCategory(null)} style={{ padding: '0.7em 1.8em', background: 'linear-gradient(135deg, #f4a9a8, #e8918e)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.95em', fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s ease', fontFamily: '"Crimson Text", serif' }}
                onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; }}
              >View all items</button>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '2em', 
              marginTop: '2em'
            }}>
              {displayedProducts.map((product) => (
                <div key={product.id} onClick={() => openGallery(product)} style={{ cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                  <article style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(74, 93, 82, 0.08)', border: '1px solid rgba(244, 169, 168, 0.15)', transition: 'all 0.3s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(74, 93, 82, 0.15)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(74, 93, 82, 0.08)'; }}
                  >
                    <div
                      className="image featured"
                      style={{
                        height: '220px',
                        background: 'linear-gradient(135deg, #faf9f7, #f5f3f0)',
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                    >
                      <img
                        src={product.imageUrls?.[0] || 'https://via.placeholder.com/400x300'}
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.15) rotate(3deg)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1) rotate(0deg)'}
                      />
                    </div>
                    <div style={{ padding: '1.5em' }}>
                      <h3 style={{ fontSize: '1em', marginBottom: '0.3em', color: '#4a5d52', fontWeight: 800, fontFamily: '"Playfair Display", serif', letterSpacing: '-0.01em', minHeight: '2.2em', lineHeight: '1.1em' }}>
                        {product.name}
                      </h3>
                      <p style={{ fontSize: '0.8em', color: '#7a8d84', marginBottom: '0.6em', fontFamily: '"Crimson Text", serif' }}>
                        {product.category}
                        <span style={{ display: 'block', fontSize: '0.75em', color: '#a8bbb2', marginTop: '0.35em' }}>Posted {product.createdAt ? new Date(product.createdAt).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : ''}</span>
                      </p>
                      <p style={{ fontWeight: 700, color: '#f4a9a8', fontSize: '1.1em', marginBottom: '0.4em', fontFamily: '"Playfair Display", serif' }}>
                        ₱{product.price?.toLocaleString() || 'Contact'}
                      </p>
                      {product.imageUrls && product.imageUrls.length > 1 && (
                        <p style={{ fontSize: '0.85em', color: '#a8bbb2', fontFamily: '"Crimson Text", serif' }}>
                          📸 {product.imageUrls.length} images • Click to view
                        </p>
                      )}
                    </div>
                  </article>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Use ProductModal component - consistent with Home page */}
      <ProductModal 
        product={selectedProduct} 
        currentIndex={currentImageIndex} 
        onClose={closeGallery} 
        setIndex={setIndex}
      />

      <Footer />
      <LoginModal isOpen={openLogin} onClose={() => setOpenLogin(false)} />
    </div>
  );
}
