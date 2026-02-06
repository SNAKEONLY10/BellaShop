import React, { useEffect, useState } from 'react';
import apiClient from '../api/client.js';

export default function BestsellerManager() {
  const [products, setProducts] = useState([]);
  const [bestsellerProducts, setBestsellerProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const [allRes, bestRes] = await Promise.all([
        apiClient.get('/api/products'),
        apiClient.get('/api/products/bestsellers'),
      ]);
      setProducts(Array.isArray(allRes.data) ? allRes.data : []);
      setBestsellerProducts(Array.isArray(bestRes.data) ? bestRes.data : []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
      setBestsellerProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const isBestseller = (productId) => {
    return bestsellerProducts.some(p => p._id === productId || p.id === productId);
  };

  const toggleBestseller = async (productId) => {
    try {
      const res = await apiClient.patch(`/api/products/${productId}/toggle-bestseller`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchProducts();
    } catch (err) {
      console.error('Error toggling bestseller:', err);
      alert('Error updating bestseller status');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2em', textAlign: 'center', color: '#7a8d84' }}>
        Loading products...
      </div>
    );
  }

  return (
    <div style={{ padding: '2em 3em', background: '#fff' }}>
      <header style={{ marginBottom: '2.5em', paddingBottom: '1.5em', borderBottom: '2px solid #f0f0f0' }}>
        <h2 style={{ fontSize: '1.8em', color: '#2f333b', fontWeight: 800, marginBottom: '0.5em', fontFamily: '"Playfair Display", serif' }}>
          🏆 Manage 6 Bestsellers
        </h2>
        <p style={{ fontSize: '1em', color: '#7a8d84', marginBottom: 0 }}>
          Select up to 6 products to display in the "6 Most Popular Items" grid on the home page. These appear in a fixed grid layout.
        </p>
      </header>

      {/* Bestseller Preview Section */}
      {bestsellerProducts.length > 0 && (
        <div style={{ padding: '2.5em', background: 'linear-gradient(135deg, #f5f3f0, #faf9f7)', border: '1px solid rgba(74, 93, 82, 0.1)', borderRadius: '8px', marginBottom: '3em' }}>
          <h3 style={{ fontSize: '1.3em', color: '#4a5d52', fontWeight: 700, marginBottom: '1.5em', fontFamily: '"Playfair Display", serif' }}>
            📊 Live Preview: Currently Displayed ({bestsellerProducts.length})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5em' }}>
            {bestsellerProducts.slice(0, 6).map((product, idx) => (
              <div key={product.id || idx} style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '0.8em', borderRadius: '6px', overflow: 'hidden', height: '150px', background: '#f0ede8' }}>
                  <img
                    src={product.imageUrls?.[0] || 'https://via.placeholder.com/150?text=No+Image'}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <p style={{ fontSize: '0.9em', fontWeight: 700, color: '#2f333b', marginBottom: '0.3em' }}>
                  {product.name.substring(0, 20)}...
                </p>
                <p style={{ fontSize: '0.8em', color: '#f4a9a8', fontWeight: 700 }}>
                  ₱{Math.round(product.price).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Products Grid with Toggle */}
      <div>
        <h3 style={{ fontSize: '1.3em', color: '#2f333b', fontWeight: 700, marginBottom: '1.5em', fontFamily: '"Playfair Display", serif' }}>
          📦 All Products (Click to Add/Remove)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2em' }}>
          {products.map((product, idx) => {
            const isBest = isBestseller(product.id);
            return (
              <div
                key={product.id || idx}
                style={{
                  padding: '1.5em',
                  background: isBest ? 'rgba(244, 169, 168, 0.04)' : '#fff',
                  border: isBest ? '2px solid #f4a9a8' : '1px solid #e0e0e0',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  boxShadow: isBest ? '0 4px 12px rgba(244, 169, 168, 0.15)' : '0 2px 6px rgba(0,0,0,0.04)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = isBest ? '0 8px 20px rgba(244, 169, 168, 0.2)' : '0 6px 16px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = isBest ? '0 4px 12px rgba(244, 169, 168, 0.15)' : '0 2px 6px rgba(0,0,0,0.04)';
                }}
              >
                {/* Image */}
                <div style={{ marginBottom: '1em', borderRadius: '6px', overflow: 'hidden', height: '200px', background: '#f5f3f0' }}>
                  <img
                    src={product.imageUrls?.[0] || 'https://via.placeholder.com/280x200?text=No+Image'}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Info */}
                <h4 style={{ fontSize: '1.05em', fontWeight: 700, color: '#2f333b', marginBottom: '0.4em', fontFamily: '"Playfair Display", serif' }}>
                  {product.name}
                </h4>

                {product.category && (
                  <p style={{ fontSize: '0.8em', color: '#7a8d84', marginBottom: '0.8em', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {product.category}
                  </p>
                )}

                <p style={{ fontSize: '1.2em', fontWeight: 800, color: '#f4a9a8', marginBottom: '1em' }}>
                  ₱{Math.round(product.price).toLocaleString()}
                </p>

                {/* Toggle Button */}
                <button
                  onClick={() => toggleBestseller(product.id)}
                  style={{
                    width: '100%',
                    padding: '0.8em 1em',
                    background: isBest ? 'linear-gradient(135deg, #f4a9a8, #e8918e)' : 'linear-gradient(135deg, #e0e0e0, #d0d0d0)',
                    color: isBest ? '#fff' : '#666',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.9em',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontFamily: '"Crimson Text", serif'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = isBest ? '0 6px 16px rgba(244, 169, 168, 0.3)' : '0 4px 10px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {isBest ? '★ Remove from Bestsellers' : '☆ Add to Bestsellers'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {products.length === 0 && (
        <div style={{ padding: '3em', textAlign: 'center', background: '#f9f9f9', borderRadius: '8px' }}>
          <p style={{ color: '#919499', fontSize: '1.05em' }}>
            No products yet. <a href="#" style={{ color: '#f4a9a8', fontWeight: 700 }}>Add a product</a> first.
          </p>
        </div>
      )}
    </div>
  );
}
