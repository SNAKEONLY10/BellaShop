import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoginModal from '../components/LoginModal';

export default function Shop() {
  const [products, setProducts] = useState([]);
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
      const res = await axios.get('/api/products');
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
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

  const nextImage = () => {
    if (selectedProduct?.imageUrls && selectedProduct.imageUrls.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedProduct.imageUrls.length);
    }
  };

  const prevImage = () => {
    if (selectedProduct?.imageUrls && selectedProduct.imageUrls.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + selectedProduct.imageUrls.length) % selectedProduct.imageUrls.length);
    }
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
          {loading ? (
            <div style={{ textAlign: 'center', padding: '6em 0', color: '#7a8d84', fontSize: '1.15em', fontFamily: '"Crimson Text", serif' }}>
              ✨ Loading our collection...
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '6em 2em', backgroundColor: 'rgba(244, 169, 168, 0.08)', borderRadius: '12px', border: '2px dashed rgba(244, 169, 168, 0.3)' }}>
              <p style={{ color: '#7a8d84', fontSize: '1.15em', fontFamily: '"Crimson Text", serif', marginBottom: '1em' }}>✨ Collection coming soon</p>
              <p style={{ color: '#a8bbb2', fontSize: '1em', fontFamily: '"Crimson Text", serif' }}>Check back soon for new premium pieces</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2.5em', marginTop: '2em' }}>
              {products.map((product) => (
                <div key={product.id} onClick={() => openGallery(product)} style={{ cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                  <article style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(74, 93, 82, 0.08)', border: '1px solid rgba(244, 169, 168, 0.15)', transition: 'all 0.3s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(74, 93, 82, 0.15)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(74, 93, 82, 0.08)'; }}
                  >
                    <div
                      className="image featured"
                      style={{
                        height: '300px',
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
                      <h3 style={{ fontSize: '1.3em', marginBottom: '0.4em', color: '#4a5d52', fontWeight: 800, fontFamily: '"Playfair Display", serif', letterSpacing: '-0.01em' }}>
                        {product.name}
                      </h3>
                      <p style={{ fontSize: '0.95em', color: '#7a8d84', marginBottom: '0.8em', fontFamily: '"Crimson Text", serif' }}>
                        {product.category}
                      </p>
                      <p style={{ fontWeight: 700, color: '#f4a9a8', fontSize: '1.3em', marginBottom: '0.6em', fontFamily: '"Playfair Display", serif' }}>
                        ₱{product.price?.toLocaleString() || 'Contact for pricing'}
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

      {/* Image Gallery Modal */}
      {selectedProduct && (
        <div
          onClick={closeGallery}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(74, 93, 82, 0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2em',
            backdropFilter: 'blur(2px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '16px',
              maxWidth: '800px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(74, 93, 82, 0.35)',
              border: '1px solid rgba(244, 169, 168, 0.2)',
            }}
          >
            {/* Close Button */}
            <button
              onClick={closeGallery}
              style={{
                position: 'absolute',
                top: '1.5em',
                right: '1.5em',
                background: 'rgba(244, 169, 168, 0.9)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1001,
                transition: 'all 0.3s ease',
                fontWeight: 700,
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f4a9a8';
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(244, 169, 168, 0.9)';
                e.target.style.transform = 'scale(1)';
              }}
            >
              ✕
            </button>

            {/* Gallery Image */}
            {selectedProduct.imageUrls && selectedProduct.imageUrls.length > 0 && (
              <div style={{ position: 'relative', background: 'linear-gradient(135deg, #faf9f7 0%, #f5f3f0 100%)' }}>
                <img
                  src={selectedProduct.imageUrls[currentImageIndex]}
                  alt={`${selectedProduct.name} view ${currentImageIndex + 1}`}
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '500px',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />

                {/* Navigation Arrows */}
                {selectedProduct.imageUrls.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      style={{
                        position: 'absolute',
                        left: '1.5em',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(244, 169, 168, 0.85)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '44px',
                        height: '44px',
                        fontSize: '22px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#f4a9a8';
                        e.target.style.transform = 'translateY(-50%) scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(244, 169, 168, 0.85)';
                        e.target.style.transform = 'translateY(-50%) scale(1)';
                      }}
                    >
                      ‹
                    </button>
                    <button
                      onClick={nextImage}
                      style={{
                        position: 'absolute',
                        right: '1.5em',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(244, 169, 168, 0.85)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '44px',
                        height: '44px',
                        fontSize: '22px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#f4a9a8';
                        e.target.style.transform = 'translateY(-50%) scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(244, 169, 168, 0.85)';
                        e.target.style.transform = 'translateY(-50%) scale(1)';
                      }}
                    >
                      ›
                    </button>

                    {/* Image Counter */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '1.5em',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(74, 93, 82, 0.85)',
                        color: '#fff',
                        padding: '0.6em 1.2em',
                        borderRadius: '25px',
                        fontSize: '0.95em',
                        fontWeight: 600,
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      {currentImageIndex + 1} / {selectedProduct.imageUrls.length}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Product Details */}
            <div style={{ padding: '2.5em' }}>
              <h2 style={{ fontSize: '1.8em', color: '#4a5d52', marginBottom: '0.3em', fontFamily: '"Playfair Display", serif', fontWeight: 800, letterSpacing: '-0.01em' }}>
                {selectedProduct.name}
              </h2>
              <p style={{ color: '#7a8d84', marginBottom: '1em', fontSize: '1em', fontFamily: '"Crimson Text", serif' }}>
                {selectedProduct.category}
              </p>
              <p style={{ fontWeight: 700, color: '#f4a9a8', fontSize: '1.6em', marginBottom: '1.5em', fontFamily: '"Playfair Display", serif' }}>
                ₱{selectedProduct.price?.toLocaleString()}
              </p>
              {selectedProduct.description && (
                <p style={{ color: '#5a6d62', lineHeight: '1.7em', marginBottom: '1.5em', fontFamily: '"Crimson Text", serif', fontSize: '1.05em' }}>
                  {selectedProduct.description}
                </p>
              )}

              {/* Thumbnail Strip */}
              {selectedProduct.imageUrls && selectedProduct.imageUrls.length > 1 && (
                <div style={{ marginTop: '1.5em', paddingTop: '1.5em', borderTop: '1px solid rgba(244, 169, 168, 0.2)' }}>
                  <p style={{ fontSize: '0.9em', color: '#7a8d84', marginBottom: '1em', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: '"Crimson Text", serif' }}>Gallery:</p>
                  <div style={{ display: 'flex', gap: '0.75em', overflowX: 'auto' }}>
                    {selectedProduct.imageUrls.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Thumbnail ${index + 1}`}
                        onClick={() => setCurrentImageIndex(index)}
                        style={{
                          width: '90px',
                          height: '90px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          border: currentImageIndex === index ? '2.5px solid #f4a9a8' : '2.5px solid rgba(244, 169, 168, 0.3)',
                          transition: 'all 0.3s ease',
                          flexShrink: 0,
                          opacity: currentImageIndex === index ? 1 : 0.7,
                        }}
                        onMouseEnter={(e) => { e.style.opacity = 1; e.style.transform = 'scale(1.05)'; }}
                        onMouseLeave={(e) => { if (currentImageIndex !== index) e.style.opacity = 0.7; e.style.transform = 'scale(1)'; }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div style={{ marginTop: '2.5em', padding: '2em', background: 'linear-gradient(135deg, rgba(244, 169, 168, 0.1) 0%, rgba(182, 186, 179, 0.05) 100%)', borderRadius: '12px', border: '1px solid rgba(244, 169, 168, 0.2)', textAlign: 'center' }}>
                <p style={{ color: '#4a5d52', fontWeight: 600, marginBottom: '1.2em', fontSize: '1.1em', fontFamily: '"Playfair Display", serif' }}>
                  ✨ Interested in this piece?
                </p>
                <a
                  href="https://www.facebook.com/messages/t/KIMMSFURNITURES"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '0.9em 2.2em',
                    background: 'linear-gradient(135deg, #f4a9a8 0%, #f08878 100%)',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontSize: '0.95em',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow: '0 8px 20px rgba(244, 169, 168, 0.25)',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: '"Crimson Text", serif',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-3px)';
                    e.target.style.boxShadow = '0 12px 32px rgba(244, 169, 168, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 8px 20px rgba(244, 169, 168, 0.25)';
                  }}
                >
                  💬 Message on Facebook
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <LoginModal isOpen={openLogin} onClose={() => setOpenLogin(false)} />
    </div>
  );
}
