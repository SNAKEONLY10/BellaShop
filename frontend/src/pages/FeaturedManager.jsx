import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FeaturedSlider from '../components/FeaturedSlider';

export default function FeaturedManager() {
  const [allProducts, setAllProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const allRes = await axios.get('/api/products');
      setAllProducts(Array.isArray(allRes.data) ? allRes.data : []);

      const featuredRes = await axios.get('/api/products/featured');
      setFeaturedProducts(Array.isArray(featuredRes.data) ? featuredRes.data : []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (productId) => {
    try {
      await axios.patch(`/api/products/${productId}/toggle-featured`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Featured status updated!');
      fetchProducts();
    } catch (err) {
      console.error('Error toggling featured:', err);
      alert('Error updating featured status');
    }
  };

  const isFeatured = (productId) => {
    return featuredProducts.some(p => p._id === productId || p.id === productId);
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2em',
  };

  const headerStyle = {
    fontSize: '2em',
    color: '#2f333b',
    marginBottom: '1.5em',
    fontFamily: '"Georgia", serif',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '2em',
    marginBottom: '2em',
  };

  const cardStyle = {
    background: '#fff',
    padding: '1.5em',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    position: 'relative',
  };

  const imageStyle = {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '4px',
    marginBottom: '1em',
  };

  const buttonStyle = {
    padding: '0.75em 1.5em',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 600,
    textTransform: 'uppercase',
    fontSize: '0.85em',
    letterSpacing: '0.1em',
    transition: 'all 0.25s ease',
  };

  const featuredButtonStyle = {
    ...buttonStyle,
    background: '#e97770',
    color: '#fff',
  };

  const unfeaturedButtonStyle = {
    ...buttonStyle,
    background: '#919499',
    color: '#fff',
  };

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: '2.5em' }}>
        <p style={{ fontSize: '0.85em', color: '#f4a9a8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5em', fontFamily: '"Crimson Text", serif' }}>
          ⭐ Slider Management
        </p>
        <h1 style={{ fontSize: '3em', color: '#4a5d52', marginBottom: '0.3em', fontFamily: '"Playfair Display", serif', fontWeight: 800, letterSpacing: '-0.02em' }}>Featured Products</h1>
        <p style={{ fontSize: '1.05em', color: '#7a8d84', fontFamily: '"Crimson Text", serif', lineHeight: '1.7em' }}>
          Select products to display in the "Best Sellers / Top Deals" slider on the home page and shop page. Featured products will appear in a horizontal scrolling carousel.
        </p>
      </div>

      {loading ? (
        <p style={{ fontSize: '1.1em', color: '#7a8d84', textAlign: 'center', padding: '3em' }}>Loading products...</p>
      ) : (
        <>
          {/* Featured Products Slider */}
          {featuredProducts.length > 0 && (
            <div style={{ marginBottom: '4em', padding: '2.5em', background: 'linear-gradient(135deg, #fff5f3, #faf9f7)', borderRadius: '12px', border: '1px solid rgba(244, 169, 168, 0.15)' }}>
              <h2 style={{ fontSize: '1.4em', color: '#4a5d52', marginBottom: '1.5em', fontFamily: '"Playfair Display", serif', fontWeight: 800 }}>⭐ Now Featured ({featuredProducts.length})</h2>
              <FeaturedSlider items={featuredProducts} onOpen={null} />
            </div>
          )}

          {/* All Products Grid */}
          <div>
            <h2 style={{ fontSize: '1.4em', color: '#4a5d52', marginBottom: '1.5em', fontFamily: '"Playfair Display", serif', fontWeight: 800 }}>
              📦 All Products ({allProducts.length})
            </h2>
            {allProducts.length === 0 ? (
              <p style={{ color: '#919499', fontStyle: 'italic', textAlign: 'center', padding: '2em' }}>
                No products yet. Add products in the "Add New" section first.
              </p>
            ) : (
              <div style={gridStyle}>
                {allProducts.map((product) => (
                  <div key={product._id || product.id} style={{...cardStyle, border: isFeatured(product._id || product.id) ? '2px solid #f4a9a8' : '1px solid #e0e0e0', background: isFeatured(product._id || product.id) ? '#fff8f7' : '#fff'}}>
                    {product.imageUrls && product.imageUrls.length > 0 && (
                      <img src={product.imageUrls[0]} alt={product.name} style={imageStyle} />
                    )}
                    <h3 style={{ fontSize: '1.1em', marginBottom: '0.5em', color: '#2f333b', fontWeight: 700 }}>
                      {product.name}
                    </h3>
                    <p style={{ fontSize: '0.9em', color: '#919499', marginBottom: '0.5em' }}>
                      {product.category}
                    </p>
                    <p style={{ fontSize: '1em', fontWeight: 700, color: '#f4a9a8', marginBottom: '1em' }}>
                      ₱{product.price?.toLocaleString()}
                    </p>
                    <button
                      onClick={() => toggleFeatured(product._id || product.id)}
                      style={isFeatured(product._id || product.id) ? unfeaturedButtonStyle : featuredButtonStyle}
                    >
                      {isFeatured(product._id || product.id) ? '★ Remove from Featured' : '☆ Add to Featured'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
