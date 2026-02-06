import React, { useEffect, useState } from 'react';
import apiClient from '../api/client.js';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoginModal from '../components/LoginModal';

export default function Collection() {
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
      const res = await apiClient.get('/api/products');
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

      {/* Collection Header */}
      <section style={{ paddingTop: '8em', background: '#f8f7f5', padding: '8em 0 4em 0' }}>
        <div className="container" style={{ maxWidth: '68em', margin: '0 auto', padding: '0 2em' }}>
          <header style={{ textAlign: 'center', marginBottom: '3em' }}>
            <h1 style={{ fontSize: '2.2em', color: '#2f333b', fontWeight: 900, marginBottom: '0.5em', fontFamily: '"Merriweather", "Georgia", serif' }}>
              KIMM'S Collection
            </h1>
            <p style={{ fontSize: '1.1em', color: '#919499', letterSpacing: '0.02em' }}>
              Carefully curated Japanese furniture pieces
            </p>
          </header>
        </div>
      </section>

      {/* Products Grid */}
      <section style={{ background: '#f8f7f5', padding: '0 0 9em 0' }}>
        <div className="container" style={{ maxWidth: '68em', margin: '0 auto', padding: '0 2em' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4em 0', color: '#919499', fontSize: '1.1em' }}>
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4em 0', color: '#919499', fontSize: '1.1em' }}>
              No products available yet. Check back soon!
            </div>
          ) : (
            <div className="row gtr-150">
              {products.map((product) => (
                <div key={product._id} className="col-4" data-fade onClick={() => openGallery(product)} style={{ cursor: 'pointer' }}>
                  <article style={{ marginBottom: '2em' }}>
                    <div
                      className="image featured"
                      style={{
                        marginBottom: '1.5em',
                        height: '280px',
                        background: '#f3f3f3',
                        borderRadius: '0.35em',
                        overflow: 'hidden',
                        transition: 'transform 0.3s ease',
                      }}
                      onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
                      onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                    >
                      <img
                        src={product.imageUrls?.[0] || 'https://via.placeholder.com/400x300'}
                        alt={product.name}
                        style={{
                          borderRadius: '0.35em',
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                    <h3 style={{ fontSize: '1.15em', marginBottom: '0.5em', color: '#2f333b', fontWeight: 700 }}>
                      {product.name}
                    </h3>
                    <p style={{ fontSize: '0.9em', color: '#919499', marginBottom: '0.75em' }}>
                      {product.category}
                    </p>
                    <p style={{ fontWeight: 700, color: '#484d55', fontSize: '1.1em', marginBottom: '0.5em' }}>
                      ₱{product.price?.toLocaleString() || 'Contact for pricing'}
                    </p>
                    {product.imageUrls && product.imageUrls.length > 1 && (
                      <p style={{ fontSize: '0.85em', color: '#919499', fontStyle: 'italic' }}>
                        {product.imageUrls.length} images available
                      </p>
                    )}
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
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2em',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '8px',
              maxWidth: '700px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            }}
          >
            {/* Close Button */}
            <button
              onClick={closeGallery}
              style={{
                position: 'absolute',
                top: '1.5em',
                right: '1.5em',
                background: 'rgba(0,0,0,0.7)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1001,
              }}
            >
              ✕
            </button>

            {/* Gallery Image */}
            {selectedProduct.imageUrls && selectedProduct.imageUrls.length > 0 && (
              <div style={{ position: 'relative' }}>
                <img
                  src={selectedProduct.imageUrls[currentImageIndex]}
                  alt={`${selectedProduct.name} view ${currentImageIndex + 1}`}
                  style={{
                    width: '100%',
                    height: '400px',
                    objectFit: 'cover',
                  }}
                />

                {/* Navigation Arrows */}
                {selectedProduct.imageUrls.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      style={{
                        position: 'absolute',
                        left: '1em',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(0,0,0,0.5)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        width: '40px',
                        height: '40px',
                        fontSize: '20px',
                        cursor: 'pointer',
                        transition: 'background 0.3s ease',
                      }}
                      onMouseEnter={(e) => (e.target.style.background = 'rgba(0,0,0,0.8)')}
                      onMouseLeave={(e) => (e.target.style.background = 'rgba(0,0,0,0.5)')}
                    >
                      ‹
                    </button>
                    <button
                      onClick={nextImage}
                      style={{
                        position: 'absolute',
                        right: '1em',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(0,0,0,0.5)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        width: '40px',
                        height: '40px',
                        fontSize: '20px',
                        cursor: 'pointer',
                        transition: 'background 0.3s ease',
                      }}
                      onMouseEnter={(e) => (e.target.style.background = 'rgba(0,0,0,0.8)')}
                      onMouseLeave={(e) => (e.target.style.background = 'rgba(0,0,0,0.5)')}
                    >
                      ›
                    </button>

                    {/* Image Counter */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '1em',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        padding: '0.5em 1em',
                        borderRadius: '4px',
                        fontSize: '0.9em',
                      }}
                    >
                      {currentImageIndex + 1} / {selectedProduct.imageUrls.length}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Product Details */}
            <div style={{ padding: '2em' }}>
              <h2 style={{ fontSize: '1.5em', color: '#2f333b', marginBottom: '0.5em', fontFamily: '"Georgia", serif', fontWeight: 700 }}>
                {selectedProduct.name}
              </h2>
              <p style={{ color: '#919499', marginBottom: '1em', fontSize: '1em' }}>
                {selectedProduct.category}
              </p>
              <p style={{ fontWeight: 700, color: '#e97770', fontSize: '1.3em', marginBottom: '1em' }}>
                ₱{selectedProduct.price?.toLocaleString()}
              </p>
              {selectedProduct.description && (
                <p style={{ color: '#484d55', lineHeight: '1.8em', marginBottom: '1.5em' }}>
                  {selectedProduct.description}
                </p>
              )}

              {/* Thumbnail Strip */}
              {selectedProduct.imageUrls && selectedProduct.imageUrls.length > 1 && (
                <div style={{ marginTop: '1.5em' }}>
                  <p style={{ fontSize: '0.9em', color: '#919499', marginBottom: '1em' }}>Images:</p>
                  <div style={{ display: 'flex', gap: '0.75em', overflowX: 'auto' }}>
                    {selectedProduct.imageUrls.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Thumbnail ${index + 1}`}
                        onClick={() => setCurrentImageIndex(index)}
                        style={{
                          width: '80px',
                          height: '80px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          border: currentImageIndex === index ? '2px solid #e97770' : '2px solid transparent',
                          transition: 'border 0.3s ease',
                          flexShrink: 0,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div style={{ marginTop: '2em', padding: '1.5em', background: '#f0ede8', borderRadius: '6px', textAlign: 'center' }}>
                <p style={{ color: '#2f333b', fontWeight: 600, marginBottom: '1em', fontSize: '1.05em' }}>
                  Interested in this piece?
                </p>
                <a
                  href="https://www.facebook.com/messages/t/KIMMSFURNITURES"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '0.75em 2em',
                    background: '#e97770',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    fontSize: '0.9em',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#f08878';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#e97770';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Message on Facebook
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
      {openLogin && <LoginModal onClose={() => setOpenLogin(false)} />}
    </div>
  );
}
