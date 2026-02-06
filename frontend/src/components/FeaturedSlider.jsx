import React, { useRef, useEffect, useState } from 'react';

export default function FeaturedSlider({ items = [], onOpen }) {
  const trackRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(1);
  const CARD_WIDTH = 280; // px
  const GAP = 18; // px (approx for 1.2em)

  useEffect(() => {
    const calc = () => {
      const track = trackRef.current;
      if (!track) return;
      const visible = Math.max(1, Math.floor(track.clientWidth / (CARD_WIDTH + GAP)));
      setItemsPerPage(visible);
      const maxPage = Math.max(0, Math.ceil(items.length / visible) - 1);
      setCurrentPage((p) => Math.min(p, maxPage));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [items.length]);

  const scrollToPage = (pageIndex) => {
    const track = trackRef.current;
    if (!track) return;
    const scrollLeft = pageIndex * (CARD_WIDTH + GAP) * itemsPerPage;
    track.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    setCurrentPage(pageIndex);
  };

  const next = () => {
    const pages = Math.ceil(items.length / itemsPerPage);
    scrollToPage(Math.min(pages - 1, currentPage + 1));
  };

  const prev = () => {
    scrollToPage(Math.max(0, currentPage - 1));
  };

  if (!items || items.length === 0) return null;

  const pages = Math.max(1, Math.ceil(items.length / itemsPerPage));

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25em' }}>
        <div>
          <p style={{ fontSize: '0.9em', color: '#f4a9a8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0, fontFamily: '"Crimson Text", serif' }}>🌟 You Might Like</p>
          <h3 style={{ margin: '6px 0 0 0', fontSize: '1.8em', color: '#4a5d52', fontWeight: 800, fontFamily: '"Playfair Display", serif' }}>Featured Products</h3>
        </div>

        <div style={{ display: 'flex', gap: '0.6em', alignItems: 'center' }}>
          <button aria-label="prev" onClick={prev} style={{ background: 'rgba(74,93,82,0.06)', border: 'none', width: 44, height: 44, borderRadius: 10, cursor: 'pointer', fontSize: 20 }}>&larr;</button>
          <div style={{ display: 'flex', gap: 8 }}>
            {Array.from({ length: pages }).map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToPage(i)}
                aria-label={`page-${i + 1}`}
                style={{
                  minWidth: 36,
                  height: 36,
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  background: i === currentPage ? '#f4a9a8' : 'transparent',
                  color: i === currentPage ? '#fff' : '#4a5d52',
                  fontWeight: 700,
                }}
              >{i + 1}</button>
            ))}
          </div>
          <button aria-label="next" onClick={next} style={{ background: 'rgba(244,169,168,0.95)', border: 'none', width: 44, height: 44, borderRadius: 10, cursor: 'pointer', color: '#fff', fontWeight: 800, fontSize: 20 }}>&rarr;</button>
        </div>
      </div>

      <div
        ref={trackRef}
        style={{
          display: 'flex',
          gap: `${GAP}px`,
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          paddingBottom: '0.5em',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {items.map((p, idx) => (
          <div
            key={p.id || p._id || idx}
            onClick={() => onOpen && onOpen(p)}
            style={{
              minWidth: CARD_WIDTH,
              flex: `0 0 ${CARD_WIDTH}px`,
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 8px 30px rgba(74,93,82,0.06)',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'transform 0.35s ease, box-shadow 0.35s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 18px 48px rgba(74,93,82,0.12)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(74,93,82,0.06)'; }}
          >
            <div style={{ height: 220, background: 'linear-gradient(135deg,#faf9f7,#f5f3f0)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={(p.imageUrls && p.imageUrls[0]) || p.imageUrl || 'https://via.placeholder.com/400x300'} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', objectPosition: 'center', transition: 'transform 0.4s ease' }} />
            </div>
            <div style={{ padding: '1em 1.1em' }}>
              <h4 style={{ margin: 0, fontSize: '1.05em', color: '#4a5d52', fontFamily: '"Playfair Display", serif', fontWeight: 800 }}>{p.name}</h4>
              <p style={{ margin: '0.6em 0 0 0', color: '#7a8d84', fontSize: '0.92em', fontFamily: '"Crimson Text", serif' }}>{p.category}</p>
              <p style={{ margin: '0.6em 0 0 0', color: '#f4a9a8', fontWeight: 800, fontSize: '1.2em', fontFamily: '"Playfair Display", serif' }}>₱{p.price?.toLocaleString() || 'Contact'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
