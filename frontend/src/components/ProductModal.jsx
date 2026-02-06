import React from 'react';

export default function ProductModal({ product, currentIndex = 0, onClose, setIndex }) {
  if (!product) return null;

  return (
    <div 
      onClick={onClose} 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        background: 'rgba(100, 70, 70, 0.5)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 1200, 
        padding: '1.5em',
        backdropFilter: 'blur(4px)'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          width: '100%', 
          maxWidth: 800,
          maxHeight: '90vh',
          background: 'linear-gradient(135deg, #fffbf9 0%, #fdf7f4 100%)', 
          borderRadius: 20, 
          overflow: 'hidden', 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr',
          boxShadow: '0 20px 60px rgba(244, 169, 168, 0.25)',
          border: '1px solid rgba(244, 169, 168, 0.2)'
        }}
      >
        {/* Left: Product Image */}
        <div 
          style={{ 
            background: 'linear-gradient(135deg, #fff8f7 0%, #f5f0f0 100%)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '2em',
            minHeight: 400,
            borderRight: '1px solid rgba(244, 169, 168, 0.15)'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <img 
              src={product.imageUrls?.[currentIndex] || product.imageUrl || 'https://via.placeholder.com/600x500'} 
              alt={product.name} 
              style={{ 
                maxWidth: '100%', 
                maxHeight: 350, 
                objectFit: 'contain',
                borderRadius: 12
              }} 
            />
            
            {/* Image Thumbnails */}
            {product.imageUrls && product.imageUrls.length > 1 && (
              <div style={{ marginTop: '1.5em', display: 'flex', gap: '0.8em', justifyContent: 'center', flexWrap: 'wrap' }}>
                {product.imageUrls.map((u, i) => (
                  <img 
                    key={i} 
                    src={u} 
                    alt={`thumb-${i}`} 
                    onClick={() => setIndex(i)} 
                    style={{ 
                      width: 70, 
                      height: 70, 
                      objectFit: 'contain', 
                      borderRadius: 8, 
                      border: currentIndex === i ? '2.5px solid #f4a9a8' : '2px solid rgba(244, 169, 168, 0.3)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      background: '#fff',
                      padding: '4px'
                    }} 
                    onMouseEnter={(e) => { e.target.style.boxShadow = '0 4px 12px rgba(244, 169, 168, 0.2)'; }}
                    onMouseLeave={(e) => { e.target.style.boxShadow = 'none'; }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Product Details */}
        <div style={{ padding: '2.5em 2em', overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {/* Header */}
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '2em', 
              color: '#3d5247',
              fontFamily: '"Playfair Display", serif',
              fontWeight: 800,
              letterSpacing: '-0.02em'
            }}>
              {product.name}
            </h1>

            {/* Category & Condition */}
            <div style={{ marginTop: '1em', display: 'flex', gap: '1.2em' }}>
              {product.category && (
                <span style={{ 
                  fontSize: '0.85em', 
                  color: '#f4a9a8', 
                  fontWeight: 700, 
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontFamily: '"Crimson Text", serif'
                }}>
                  📌 {product.category}
                </span>
              )}
              {product.condition && (
                <span style={{ 
                  fontSize: '0.85em', 
                  color: '#7a8d84', 
                  fontWeight: 700, 
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontFamily: '"Crimson Text", serif'
                }}>
                  ✨ {product.condition}
                </span>
              )}
            </div>

            {/* Price */}
            <div style={{ marginTop: '1.5em', padding: '1.2em', background: 'linear-gradient(135deg, rgba(244, 169, 168, 0.12), rgba(244, 169, 168, 0.06))', borderRadius: 12, border: '1px solid rgba(244, 169, 168, 0.2)' }}>
              <p style={{ margin: '0 0 0.5em 0', fontSize: '0.8em', color: '#7a8d84', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>💳 Price</p>
              <p style={{ 
                margin: 0,
                fontSize: '2.2em', 
                color: '#f4a9a8', 
                fontWeight: 800,
                fontFamily: '"Playfair Display", serif'
              }}>
                ₱{product.price?.toLocaleString() || 'Contact'}
              </p>
            </div>

            {/* Description */}
            {product.description && (
              <div style={{ marginTop: '1.8em' }}>
                <h3 style={{ 
                  fontSize: '0.9em', 
                  color: '#3d5247', 
                  fontWeight: 700, 
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  margin: '0 0 0.8em 0',
                  fontFamily: '"Crimson Text", serif'
                }}>
                  📝 Description
                </h3>
                <p style={{ 
                  margin: 0,
                  color: '#5a6b65', 
                  lineHeight: '1.7em',
                  fontSize: '0.95em',
                  fontFamily: '"Crimson Text", serif'
                }}>
                  {product.description}
                </p>
              </div>
            )}
          </div>

          {/* CTA Buttons */}
          <div style={{ marginTop: '2em', display: 'flex', gap: '0.8em', flexDirection: 'column' }}>
            <a 
              href="https://www.facebook.com/kimmsjapansurplus" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ 
                display: 'inline-block', 
                padding: '1.1em 1.8em', 
                background: 'linear-gradient(135deg, #f4a9a8, #e8918e)', 
                color: '#fff', 
                borderRadius: 10, 
                textDecoration: 'none', 
                fontWeight: 700,
                textAlign: 'center',
                transition: 'all 0.3s ease',
                fontSize: '0.95em',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                fontFamily: '"Crimson Text", serif',
                boxShadow: '0 6px 20px rgba(244, 169, 168, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #e8918e, #dd7a76)';
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 10px 30px rgba(244, 169, 168, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #f4a9a8, #e8918e)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 20px rgba(244, 169, 168, 0.3)';
              }}
            >
              💬 Message on Facebook
            </a>
            <button 
              onClick={onClose} 
              style={{ 
                padding: '1.1em 1.8em', 
                borderRadius: 10, 
                border: '1.5px solid rgba(244, 169, 168, 0.4)', 
                background: '#fff', 
                cursor: 'pointer',
                fontWeight: 700,
                color: '#5a6b65',
                transition: 'all 0.3s ease',
                fontSize: '0.95em',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                fontFamily: '"Crimson Text", serif'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(244, 169, 168, 0.08)';
                e.target.style.borderColor = 'rgba(244, 169, 168, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#fff';
                e.target.style.borderColor = 'rgba(244, 169, 168, 0.4)';
              }}
            >
              ✕ Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
