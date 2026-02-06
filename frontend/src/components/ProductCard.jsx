import React from 'react';

export default function ProductCard({ product }) {
  const image = product.imageUrl || product.image || 'https://images.unsplash.com/photo-1549187774-b4e9c0f0b8ba?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=4f3d5e6a7b8c9d0a1b2c3d4e5f6a7b8c';
  return (
    <article className="product-card">
      <div className="product-image">
        <img src={image} alt={product.name} />
      </div>
      <div className="product-body">
        <h3>{product.name}</h3>
        <div className="product-meta">
          <span>{product.category || 'Furniture'}</span>
          <span className="badge">{product.condition || 'New'}</span>
        </div>
        <div style={{marginTop:10,fontWeight:600}}>{product.price ? `$${product.price}` : ''}</div>
      </div>
    </article>
  );
}
