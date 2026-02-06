import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoginModal from '../components/LoginModal';
import FeaturedSlider from '../components/FeaturedSlider';
import ProductModal from '../components/ProductModal';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellerProducts, setBestSellerProducts] = useState([]);
  const [highlightedProducts, setHighlightedProducts] = useState([]);
  const [openLogin, setOpenLogin] = useState(false);
  const [openProduct, setOpenProduct] = useState(null);
  const [productImageIndex, setProductImageIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      axios.get('/api/products/featured'),
      axios.get('/api/products/bestsellers'),
      axios.get('/api/products/highlighted')
    ]).then(([featRes, bestRes, highlightRes]) => {
      if (!mounted) return;
      setFeaturedProducts(Array.isArray(featRes.data) ? featRes.data : []);
      setBestSellerProducts(Array.isArray(bestRes.data) ? bestRes.data : []);
      setHighlightedProducts(Array.isArray(highlightRes.data) ? highlightRes.data : []);
    }).catch(() => {
      if (!mounted) return;
      setFeaturedProducts([]);
      setBestSellerProducts([]);
      setHighlightedProducts([]);
    });
    return () => { mounted = false; };
  }, []);

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
  }, [featuredProducts]);

  return (
    <div id="page-wrapper">
      <Header onAdminClick={() => setOpenLogin(true)} />

      {/* Hero Intro Section */}
      <section id="intro" className="wrapper style1" style={{paddingTop:'8em', backgroundImage: 'url(https://i.ibb.co/gLgskDY9/image-2026-02-06-084233397.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', position: 'relative'}}>
        {/* Soft Overlay */}
        <div style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.50)', pointerEvents: 'none'}}></div>

        <div className="container" style={{position: 'relative', zIndex: 1}}>
          <p style={{fontSize: '0.85em', color: '#f4a9a8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '0.8em', fontFamily: '"Crimson Text", serif'}}>
            ✨ Curated Beauty for Modern Homes ✨
          </p>
          <h1 style={{fontSize: '3.2em', color: '#fff', fontWeight: 800, marginBottom: '1em', fontFamily: '"Playfair Display", serif', lineHeight: '1.2em', letterSpacing: '-0.02em'}}>
            Premium Japanese Furniture for Every Home
          </h1>
          <p style={{fontSize: '1.15em', color: 'rgba(255,255,255,0.98)', marginBottom: '2.5em', lineHeight: '1.8em', maxWidth: '720px', margin: '0 auto 2.5em auto', fontFamily: '"Crimson Text", serif', fontWeight: 500}}>
            Discover thoughtfully curated Japanese furniture that brings warmth and elegance to your space. Each piece tells a story of craftsmanship, quality, and timeless beauty—perfect for moms, families, and those who appreciate the art of living well.
          </p>
          <ul className="actions" style={{justifyContent: 'center', display: 'flex', gap: '1.5rem', listStyle: 'none', margin: 0, padding: 0}}>
            <li><a href="#featured" style={{
              display: 'inline-block',
              padding: '0.95em 2.5em',
              background: 'linear-gradient(135deg, #f4a9a8, #e8918e)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1em',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textDecoration: 'none',
              boxShadow: '0 8px 25px rgba(244, 169, 168, 0.3)',
              fontFamily: '"Crimson Text", serif'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #e8918e, #dd7a76)';
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 12px 35px rgba(244, 169, 168, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #f4a9a8, #e8918e)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 25px rgba(244, 169, 168, 0.3)';
            }}>✨ Shop Collection</a></li>
            <li><a href="#contact" style={{
              display: 'inline-block',
              padding: '0.95em 2.5em',
              background: 'transparent',
              color: '#fff',
              border: '2px solid rgba(255,255,255,0.5)',
              borderRadius: '8px',
              fontSize: '1em',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textDecoration: 'none',
              fontFamily: '"Crimson Text", serif'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.12)';
              e.target.style.borderColor = 'rgba(255,255,255,0.8)';
              e.target.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.borderColor = 'rgba(255,255,255,0.5)';
              e.target.style.transform = 'translateY(0)';
            }}>Get in Touch</a></li>
          </ul>
        </div>
      </section>

      {/* Best Sellers Grid (6 Fixed Items) */}
      {bestSellerProducts.length > 0 && (
        <section style={{ background: 'linear-gradient(135deg, #fff5f3 0%, #faf9f7 100%)', padding: '7em 0 5em', borderBottom: '1px solid rgba(244, 169, 168, 0.15)' }}>
          <div className="container">
            <header style={{textAlign: 'center', marginBottom: '3em'}}>
              <p style={{fontSize: '0.9em', color: '#f4a9a8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.8em', fontFamily: '"Crimson Text", serif'}}>
                ⭐ Bestsellers & Top Picks
              </p>
              <h2 style={{fontSize: '2.5em', color: '#4a5d52', fontWeight: 800, marginBottom: '0.5em', fontFamily: '"Playfair Display", serif', letterSpacing: '-0.02em'}}>Most Popular Items</h2>
              <p style={{fontSize: '1em', color: '#7a8d84', letterSpacing: '0.05em', fontFamily: '"Crimson Text", serif', maxWidth: '600px', margin: '0.5em auto 0'}}>Hand-selected favorites loved by our customers</p>
            </header>

            {/* 6-Item Grid - 3 Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2em', marginTop: '2.5em' }}>
              {bestSellerProducts.slice(0, 6).map((product, idx) => (
                <div 
                  key={product.id || idx}
                  onClick={() => { setProductImageIndex(0); setOpenProduct(product); }}
                  style={{
                    cursor: 'pointer',
                    padding: '1.2em',
                    background: '#fff',
                    borderRadius: '12px',
                    border: '1.5px solid',
                    borderImage: 'linear-gradient(135deg, rgba(244, 169, 168, 0.4), rgba(74, 93, 82, 0.15)) 1',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow: '0 4px 16px rgba(244, 169, 168, 0.1)',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(244, 169, 168, 0.18)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(244, 169, 168, 0.1)';
                  }}
                >
                  {/* Product Image - Nice Style */}
                  <div style={{ position: 'relative', marginBottom: '1em', overflow: 'hidden', borderRadius: '8px', height: '220px', background: 'linear-gradient(135deg, #faf9f7, #f5f3f0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      src={product.imageUrls?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
                      alt={product.name}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', objectPosition: 'center', transition: 'transform 0.4s ease' }}

                      onMouseEnter={(e) => { e.target.style.transform = 'scale(1.05)'; }}
                      onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}
                    />
                    {product.condition && (
                      <div style={{
                        position: 'absolute',
                        top: '0.8em',
                        right: '0.8em',
                        background: '#f4a9a8',
                        color: '#fff',
                        padding: '0.4em 0.8em',
                        borderRadius: '20px',
                        fontSize: '0.75em',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}>
                        {product.condition}
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <h4 style={{ fontSize: '1em', fontWeight: 700, color: '#2f333b', marginBottom: '0.5em', fontFamily: '"Playfair Display", serif', lineHeight: '1.3em', minHeight: '2.6em' }}>
                    {product.name}
                  </h4>
                  
                  {product.category && (
                    <p style={{ fontSize: '0.8em', color: '#7a8d84', marginBottom: '0.8em', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {product.category}
                    </p>
                  )}

                  <p style={{ fontSize: '1.25em', fontWeight: 800, color: '#f4a9a8', marginTop: '1em' }}>
                    ₱{Math.round(product.price).toLocaleString()}
                  </p>

                  <button
                    onClick={(e) => { e.stopPropagation(); setProductImageIndex(0); setOpenProduct(product); }}
                    style={{
                      width: '100%',
                      marginTop: '1em',
                      padding: '0.8em',
                      background: 'linear-gradient(135deg, #f4a9a8, #e8918e)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.9em',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      fontFamily: '"Crimson Text", serif'
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
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Slider Section */}
      <section id="featured" style={{background: 'linear-gradient(135deg, #faf9f7 0%, #f5f3f0 100%)', padding: '7em 0 9em 0', borderTop: '2px solid rgba(244, 169, 168, 0.15)'}}>
        <div className="container">
          <header style={{textAlign: 'center', marginBottom: '3.5em'}}>
            <p style={{fontSize: '0.9em', color: '#f4a9a8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.8em', fontFamily: '"Crimson Text", serif'}}>
              🌸 Handpicked for You
            </p>
            <h2 style={{fontSize: '3em', color: '#4a5d52', fontWeight: 800, marginBottom: '0.5em', fontFamily: '"Playfair Display", serif', letterSpacing: '-0.02em'}}>Featured Selection</h2>
            <p style={{fontSize: '1.15em', color: '#7a8d84', letterSpacing: '0.05em', fontFamily: '"Crimson Text", serif', maxWidth: '600px', margin: '0.5em auto 0'}}>Explore our curated collection — scroll left & right to discover more treasures</p>
          </header>

          <div style={{ marginTop: '1.5em' }}>
            <FeaturedSlider showHeader={false} items={featuredProducts} onOpen={(p) => { setProductImageIndex(0); setOpenProduct(p); }} />
          </div>

          <ul style={{marginTop:'4em', display: 'flex', justifyContent: 'center', listStyle: 'none', margin: '4em auto 0 auto', padding: 0}}>
            <li><a href="/shop" style={{
              display: 'inline-block',
              padding: '1em 2.5em',
              background: 'linear-gradient(135deg, #4a5d52, #3d4f47)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1em',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textDecoration: 'none',
              fontFamily: '"Crimson Text", serif',
              boxShadow: '0 8px 25px rgba(74, 93, 82, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #3d4f47, #2f4138)';
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 12px 35px rgba(74, 93, 82, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #4a5d52, #3d4f47)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 25px rgba(74, 93, 82, 0.2)';
            }}>Request Information</a></li>
          </ul>
        </div>
      </section>

      {/* You May Also Like Section */}
      {highlightedProducts.length > 0 && (
        <section style={{background: 'linear-gradient(135deg, #fff5f3 0%, #faf9f7 100%)', padding: '7em 0 9em 0', borderTop: '2px solid rgba(244, 169, 168, 0.15)'}}>
          <div className="container">
            <header style={{textAlign: 'center', marginBottom: '3.5em'}}>
              <p style={{fontSize: '0.9em', color: '#f4a9a8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.8em', fontFamily: '"Crimson Text", serif'}}>
                💎 Specially Selected
              </p>
              <h2 style={{fontSize: '3em', color: '#4a5d52', fontWeight: 800, marginBottom: '0.5em', fontFamily: '"Playfair Display", serif', letterSpacing: '-0.02em'}}>You May Also Like</h2>
              <p style={{fontSize: '1.15em', color: '#7a8d84', letterSpacing: '0.05em', fontFamily: '"Crimson Text", serif', maxWidth: '600px', margin: '0.5em auto 0'}}>Discover pieces that complement your home's aesthetic and bring joy to everyday moments</p>
            </header>

            <div style={{ marginTop: '1.5em' }}>
              <FeaturedSlider showHeader={false} items={highlightedProducts} onOpen={(p) => { setProductImageIndex(0); setOpenProduct(p); }} />
            </div>
          </div>
        </section>
      )}

      {/* Philosophy Section */}
      <section id="philosophy" style={{background: '#fff', padding: '6em 0 9em 0'}}>
        <div className="container">
          <header style={{textAlign: 'center', marginBottom: '3em'}} data-aos="fade-up">
            <h2 style={{fontSize: '2.2em', color: '#2f333b', fontWeight: 900, marginBottom: '0.5em', fontFamily: '"Merriweather", "Georgia", serif'}}>BEAUTIFY YOUR HOME WITH PREMIUM JAPAN FURNITURE</h2>
            <p style={{fontSize: '1.1em', color: '#919499', letterSpacing: '0.02em'}}>Discover durable, stylish pieces straight from Japan.</p>
          </header>

          <div className="row gtr-150" style={{marginTop:'3em'}}>
            <div className="col-6" data-fade>
              <div className="image fit">
                <img 
                  src="https://i.ibb.co/QjcZkV6K/628239762-1516112270519314-427770195022449884-n.jpg" 
                  alt="Craftsmanship"
                  style={{borderRadius:'8px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)'}}
                />
              </div>
            </div>
            <div className="col-6" data-fade>
              <h3 style={{fontSize:'1.35em', color:'#2f333b', marginBottom:'0.75em', fontWeight: 700, fontFamily: '"Merriweather", "Georgia", serif'}}>Exceptional Quality, Accessible Prices</h3>
              <p style={{marginBottom:'1.2em', color:'#484d55', lineHeight:'1.8em', fontSize: '1.05em', fontFamily: '"Source Sans Pro", sans-serif'}}>
                Find exceptional quality at accessible prices — hand-selected pieces that balance true craftsmanship with thoughtful value.
              </p>
              <h3 style={{fontSize:'1.35em', color:'#2f333b', marginBottom:'0.75em', fontWeight: 700, fontFamily: '"Merriweather", "Georgia", serif'}}>Discover Durable Craftsmanship</h3>
              <p style={{marginBottom:'1.2em', color:'#484d55', lineHeight:'1.8em', fontSize: '1.05em', fontFamily: '"Source Sans Pro", sans-serif'}}>
                Built from premium hardwoods and finishes chosen for longevity and enduring beauty — pieces that grow richer with time.
              </p>
              <h3 style={{fontSize:'1.35em', color:'#2f333b', marginBottom:'0.75em', fontWeight: 700, fontFamily: '"Merriweather", "Georgia", serif'}}>Designed to Elevate Your Home</h3>
              <p style={{color:'#484d55', lineHeight:'1.8em', fontSize: '1.05em', fontFamily: '"Source Sans Pro", sans-serif'}}>
                Minimal silhouettes and precise joinery create functional, elegant pieces you can live with every day — discover durable, stylish pieces straight from Japan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why KIMM'S Works Section */}
      <section style={{background: '#f0ede8', padding: '6em 0 9em 0'}}>
        <div className="container">
          <header style={{textAlign: 'center', marginBottom: '3em'}}>
            <h2 style={{fontSize: '2.2em', color: '#2f333b', fontWeight: 900, marginBottom: '0.5em', fontFamily: '"Merriweather", "Georgia", serif'}}>Why Choose KIMM'S?</h2>
            <p style={{fontSize: '1.1em', color: '#919499', letterSpacing: '0.02em'}}>Your Trusted Source of Premium Japan-Made Furniture</p>
          </header>

          <div className="row gtr-150">
            <div className="col-4" data-fade>
              <div style={{textAlign:'center', marginBottom:'2em'}}>
                <h3 style={{
                  fontSize:'3.5em', 
                  color:'#e97770', 
                  fontWeight: 900, 
                  margin:'0 0 0.5em 0'
                }}>✓</h3>
              </div>
              <h3 style={{fontSize:'1.3em', color:'#2f333b', marginBottom:'1em', fontWeight: 700, fontFamily: '"Merriweather", "Georgia", serif', textAlign:'center'}}>Direct from Japan</h3>
              <p style={{color: '#484d55', lineHeight: '1.8em', fontSize: '1.05em', textAlign:'center'}}>Hand-selected pieces sourced directly from master craftspeople and established workshops—authentic quality you can trust.</p>
            </div>
            <div className="col-4" data-fade>
              <div style={{textAlign:'center', marginBottom:'2em'}}>
                <h3 style={{
                  fontSize:'3.5em', 
                  color:'#e97770', 
                  fontWeight: 900, 
                  margin:'0 0 0.5em 0'
                }}>◆</h3>
              </div>
              <h3 style={{fontSize:'1.3em', color:'#2f333b', marginBottom:'1em', fontWeight: 700, fontFamily: '"Merriweather", "Georgia", serif', textAlign:'center'}}>Convenient Shopping</h3>
              <p style={{color: '#484d55', lineHeight: '1.8em', fontSize: '1.05em', textAlign:'center'}}>Same-day delivery available, cash on delivery accepted—no hassle, just quality furniture delivered straight to your home.</p>
            </div>
            <div className="col-4" data-fade>
              <div style={{textAlign:'center', marginBottom:'2em'}}>
                <h3 style={{
                  fontSize:'3.5em', 
                  color:'#e97770', 
                  fontWeight: 900, 
                  margin:'0 0 0.5em 0'
                }}>❤</h3>
              </div>
              <h3 style={{fontSize:'1.3em', color:'#2f333b', marginBottom:'1em', fontWeight: 700, fontFamily: '"Merriweather", "Georgia", serif', textAlign:'center'}}>Personal Touch</h3>
              <p style={{color: '#484d55', lineHeight: '1.8em', fontSize: '1.05em', textAlign:'center'}}>Message us anytime for expert guidance, custom requests, or to see pieces that match your vision—we're here for you.</p>
            </div>
          </div>

          {/* Delivery Promise Banner */}
          <div style={{marginTop: '4em', padding: '3em 2.5em', background: 'rgba(233, 119, 112, 0.08)', borderRadius: '8px', border: '2px solid rgba(233, 119, 112, 0.15)'}}>
            <h3 style={{fontSize: '1.5em', color: '#2f333b', fontWeight: 700, marginBottom: '2em', fontFamily: '"Georgia", "Garamond", serif', textAlign: 'center'}}>🚚 Door-to-Door Delivery Made Easy</h3>
            <div style={{marginBottom: '2em', textAlign: 'center'}}>
              <img src="https://i.ibb.co/S4QsR1wj/596257293-1465986395531902-6468251702285956978-n.jpg" alt="KIMM'S Delivery Truck" style={{maxWidth: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
            </div>
            <p style={{color: '#484d55', lineHeight: '1.8em', fontSize: '1.05em', textAlign: 'center', marginBottom: '1.5em'}}>Browse our wide selection of premium cabinets, tables, shelves, and home essentials. Pick your favorites, message us, and we'll deliver straight to your doorstep—whether you're in Tabaco or Ligao City.</p>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2em', marginTop: '2em'}}>
              <div style={{textAlign: 'center'}}>
                <p style={{color: '#e97770', fontWeight: 700, fontSize: '1.1em', marginBottom: '0.5em'}}>✅ Style & Durability</p>
                <p style={{color: '#919499', fontSize: '0.95em', lineHeight: '1.6em'}}>Premium Japan surplus—affordable luxury for every space.</p>
              </div>
              <div style={{textAlign: 'center'}}>
                <p style={{color: '#e97770', fontWeight: 700, fontSize: '1.1em', marginBottom: '0.5em'}}>⚡ Lightning Fast</p>
                <p style={{color: '#919499', fontSize: '0.95em', lineHeight: '1.6em'}}>Same-day delivery available—upgrade your home without the wait.</p>
              </div>
              <div style={{textAlign: 'center'}}>
                <p style={{color: '#e97770', fontWeight: 700, fontSize: '1.1em', marginBottom: '0.5em'}}>💳 Flexible Payment</p>
                <p style={{color: '#919499', fontSize: '0.95em', lineHeight: '1.6em'}}>Cash on delivery—pay when your furniture arrives, peace of mind included.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact/CTA Section */}
      <section id="contact" style={{background: '#f8f7f5', padding: '6em 0 9em 0'}}>
        <div className="container">
          <header style={{textAlign: 'center', marginBottom: '3em'}}>
            <h2 style={{fontSize: '2.2em', color: '#2f333b', fontWeight: 900, marginBottom: '0.5em', fontFamily: '"Georgia", "Garamond", serif'}}>KIMM'S Furnitures & Merchandise</h2>
            <p style={{fontSize: '1.1em', color: '#919499', letterSpacing: '0.05em'}}>Exceptional Japanese Furniture for the Filipino Home</p>
          </header>

          <div style={{maxWidth:'650px',margin:'3em auto'}} data-fade>
            <div style={{marginBottom:'2em', padding:'2.5em', background:'#fff', borderRadius:'8px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', border: '1px solid #eee'}}>
              <h3 style={{color:'#2f333b', marginBottom:'1em', fontSize:'1.15em', fontWeight: 700, fontFamily: '"Georgia", "Garamond", serif'}}>Tabaco City Branch</h3>
              <p style={{color:'#484d55', marginBottom:'0.5em', fontWeight:600, fontSize: '1.05em'}}>
                Zone 1 Berces St. Baranghawon, Tabaco City
              </p>
              <p style={{color:'#919499', fontSize:'0.95em', marginBottom:'0', lineHeight: '1.6em'}}>
                Beside Amando Cope College
              </p>
            </div>

            <div style={{marginBottom:'2em', padding:'2.5em', background:'#fff', borderRadius:'8px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', border: '1px solid #eee'}}>
              <h3 style={{color:'#2f333b', marginBottom:'1em', fontSize:'1.15em', fontWeight: 700, fontFamily: '"Georgia", "Garamond", serif'}}>Ligao City Branch</h3>
              <p style={{color:'#484d55', marginBottom:'0.5em', fontWeight:600, fontSize: '1.05em'}}>
                Zone 5 Binatagan, Ligao City
              </p>
              <p style={{color:'#919499', fontSize:'0.95em', marginBottom:'0', lineHeight: '1.6em'}}>
                Beside Ligao Ice Plant
              </p>
            </div>

            <div style={{marginBottom:'3em', borderRadius:'8px', overflow:'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)'}}>
              <img 
                src="https://i.ibb.co/N6j77mjk/571702444-1431164409014101-8130964858896964398-n.jpg" 
                alt="KIMM's Ligao Branch - Spot the Sign"
                style={{width:'100%', height:'auto', display:'block'}}
              />
            </div>

            <div style={{marginBottom:'2.5em', padding:'2.5em', background:'#fff', borderRadius:'8px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', border: '1px solid #eee'}}>
              <h3 style={{color:'#2f333b', marginBottom:'1.5em', fontSize:'1.15em', fontWeight: 700, fontFamily: '"Georgia", "Garamond", serif'}}>Contact Information</h3>
              <p style={{color:'#484d55', margin:'0.75em 0', fontSize: '1.05em'}}>
                <strong>Phone:</strong> <a href="tel:+639959372422" style={{color:'#2f333b', textDecoration:'none', fontWeight: 600}}>0995 937 2422</a>
              </p>
              <p style={{color:'#484d55', margin:'0.75em 0', fontSize: '1.05em'}}>
                <strong>Email:</strong> <a href="mailto:kimmsfurnituresinquiry@gmail.com" style={{color:'#2f333b', textDecoration:'none', fontWeight: 600}}>kimmsfurnituresinquiry@gmail.com</a>
              </p>
              <p style={{color:'#484d55', margin:'0.75em 0', fontSize: '1.05em'}}>
                <strong>Facebook:</strong> <a href="https://facebook.com/kimmsfurnitures" target="_blank" rel="noreferrer" style={{color:'#2f333b', textDecoration:'none', fontWeight: 600}}>kimmsfurnitures</a>
              </p>
            </div>

            <div style={{background:'#fff', padding:'2.5em', borderRadius:'8px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', border: '1px solid #eee', marginBottom:'2.5em'}}>
              <h3 style={{color:'#2f333b', marginBottom:'1em', fontSize:'1.15em', fontWeight: 700, fontFamily: '"Georgia", "Garamond", serif', textAlign:'center'}}>Spot the Sign? You're at the Right Place! 🤗</h3>
              <p style={{color:'#484d55', marginBottom:'0.75em', lineHeight:'1.8em', fontSize: '1.05em', textAlign:'center'}}>
                Your next favorite furniture might be waiting inside 😍
              </p>
              <p style={{color:'#484d55', marginBottom:'1em', lineHeight:'1.8em', fontSize: '1.05em', textAlign:'center'}}>
                Come visit <strong>KIMM'S Furnitures & Merchandise</strong> 🇯🇵
              </p>
              <p style={{color:'#919499', marginBottom:'0', lineHeight:'1.6em', fontSize: '0.95em', textAlign:'center', fontStyle:'italic'}}>
                See you there! ❤️
              </p>
            </div>
            <ul style={{display: 'flex', justifyContent: 'center', gap: '1rem', listStyle: 'none', margin: 0, padding: 0, flexWrap: 'wrap'}}>
              <li><a href="https://www.facebook.com/messages/t/kimmsfurnitures" target="_blank" rel="noreferrer" style={{
                display: 'inline-block',
                padding: '0.95em 2.25em',
                background: '#2f333b',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.9em',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#1a1d22';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#2f333b';
                e.target.style.transform = 'translateY(0)';
              }}>Message on Facebook</a></li>
              <li><a href="tel:+639959372422" style={{
                display: 'inline-block',
                padding: '0.95em 2.25em',
                background: 'transparent',
                color: '#2f333b',
                border: '2px solid #2f333b',
                borderRadius: '4px',
                fontSize: '0.9em',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f0f0f0';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.transform = 'translateY(0)';
              }}>Call Us</a></li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      <LoginModal isOpen={openLogin} onClose={() => setOpenLogin(false)} />

      {openProduct && (
        <ProductModal
          product={openProduct}
          currentIndex={productImageIndex}
          setIndex={setProductImageIndex}
          onClose={() => setOpenProduct(null)}
        />
      )}

      <style>{`
        [data-fade] {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        [data-fade].fade-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}