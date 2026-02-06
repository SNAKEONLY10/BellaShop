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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2em', marginTop: '2em' }}>
              {products.filter(p => selectedCategory ? p.category === selectedCategory : true).map((product) => (
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
