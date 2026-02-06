import React from 'react';

export default function Footer() {
  return (
    <footer id="footer" style={{ background: 'linear-gradient(135deg, #faf9f7 0%, #f5f3f0 100%)', borderTop: '1px solid rgba(244, 169, 168, 0.2)', paddingTop: '3em', paddingBottom: '2em' }}>
      <div className="container" style={{ maxWidth: '68em', margin: '0 auto', padding: '0 2em' }}>
        {/* Main Footer Content */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3em', marginBottom: '3em' }}>
          {/* About Section */}
          <div>
            <h3 style={{ fontSize: '1.5em', color: '#4a5d52', fontWeight: 800, marginBottom: '1em', fontFamily: '"Playfair Display", serif', letterSpacing: '-0.01em' }}>
              ✨ KIMM'S
            </h3>
            <p style={{ color: '#7a8d84', lineHeight: '1.7em', fontSize: '0.95em', fontFamily: '"Crimson Text", serif', marginBottom: '1em' }}>
              Welcome to Kimm's Furnitures & Merchandise! We offer Japan and UK surplus with quality housewares, personal goods, and furniture. Our mission is to bring splendid, quality products to every home.
            </p>
            <p style={{ color: '#7a8d84', lineHeight: '1.6em', fontSize: '0.9em', fontFamily: '"Crimson Text", serif', marginBottom: '0.8em' }}>
              Our products are reasonably priced, rare, collectible, luxurious and classic—designed to last for generations. Whether brand new or well-loved, every piece carries quality and character.
            </p>
            <p style={{ color: '#a8bbb2', fontSize: '0.9em', fontFamily: '"Crimson Text", serif' }}>
              🏠 One-stop shop for homes that deserve better.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '1.1em', color: '#4a5d52', fontWeight: 700, marginBottom: '1.2em', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: '"Crimson Text", serif' }}>
              Quick Links
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Home', 'About', 'Shop', 'Contact'].map((item, idx) => (
                <li key={idx} style={{ marginBottom: '0.8em' }}>
                  <a href="#" style={{ color: '#7a8d84', textDecoration: 'none', fontFamily: '"Crimson Text", serif', fontSize: '0.95em', transition: 'color 0.3s ease' }} onMouseEnter={(e) => e.target.style.color = '#f4a9a8'} onMouseLeave={(e) => e.target.style.color = '#7a8d84'}>
                    → {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Help & Info */}
          <div>
            <h4 style={{ fontSize: '1.1em', color: '#4a5d52', fontWeight: 700, marginBottom: '1.2em', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: '"Crimson Text", serif' }}>
              Help & Info
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Track Your Order', 'Returns & Exchanges', 'Shipping & Delivery', 'FAQs', 'Contact Us'].map((item, idx) => (
                <li key={idx} style={{ marginBottom: '0.8em' }}>
                  <a href="#" style={{ color: '#7a8d84', textDecoration: 'none', fontFamily: '"Crimson Text", serif', fontSize: '0.95em', transition: 'color 0.3s ease' }} onMouseEnter={(e) => e.target.style.color = '#f4a9a8'} onMouseLeave={(e) => e.target.style.color = '#7a8d84'}>
                    → {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 style={{ fontSize: '1.1em', color: '#4a5d52', fontWeight: 700, marginBottom: '1.2em', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: '"Crimson Text", serif' }}>
              Get in Touch
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
              <div style={{ padding: '1em', background: 'rgba(244, 169, 168, 0.1)', borderRadius: '8px', borderLeft: '3px solid #f4a9a8' }}>
                <p style={{ color: '#7a8d84', fontSize: '0.85em', fontFamily: '"Crimson Text", serif', fontWeight: 600, marginBottom: '0.4em' }}>📞 Call Us</p>
                <a href="tel:+639959372422" style={{ color: '#f4a9a8', textDecoration: 'none', fontFamily: '"Playfair Display", serif', fontSize: '1.1em', fontWeight: 700 }}>
                  0995 937 2422
                </a>
              </div>
              <div style={{ padding: '1em', background: 'rgba(244, 169, 168, 0.1)', borderRadius: '8px', borderLeft: '3px solid #f4a9a8' }}>
                <p style={{ color: '#7a8d84', fontSize: '0.85em', fontFamily: '"Crimson Text", serif', fontWeight: 600, marginBottom: '0.4em' }}>✉️ Email</p>
                <a href="mailto:kimmsfurnituresinquiry@gmail.com" style={{ color: '#f4a9a8', textDecoration: 'none', fontFamily: '"Playfair Display", serif', fontSize: '0.95em', fontWeight: 700, wordBreak: 'break-all' }}>
                  kimmsfurnituresinquiry@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(244, 169, 168, 0.3)', margin: '2em 0' }}></div>

        {/* Bottom Footer */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2em', alignItems: 'center' }}>
          {/* Payment Methods */}
          <div>
            <p style={{ color: '#7a8d84', fontSize: '0.85em', fontWeight: 600, marginBottom: '0.8em', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: '"Crimson Text", serif' }}>
              💳 Payment Options
            </p>
            <div style={{ display: 'flex', gap: '1em', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '2em' }}>💳</span>
              <span style={{ fontSize: '2em' }}>📱</span>
              <span style={{ fontSize: '2em' }}>🏦</span>
              <p style={{ color: '#a8bbb2', fontSize: '0.85em', fontFamily: '"Crimson Text", serif' }}>Cards • Mobile • Bank Transfer</p>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <p style={{ color: '#7a8d84', fontSize: '0.85em', fontWeight: 600, marginBottom: '0.8em', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: '"Crimson Text", serif' }}>
              Follow Us
            </p>
            <div style={{ display: 'flex', gap: '1em' }}>
              <a href="https://www.facebook.com/kimmsjapansurplus" target="_blank" rel="noopener noreferrer" style={{ fontSize: '1.8em', textDecoration: 'none', transition: 'transform 0.3s ease' }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.15)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
                👍
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div style={{ marginTop: '2em', paddingTop: '2em', borderTop: '1px solid rgba(244, 169, 168, 0.2)', textAlign: 'center' }}>
          <p style={{ color: '#a8bbb2', fontSize: '0.9em', fontFamily: '"Crimson Text", serif', margin: 0 }}>
            © 2024 KIMM'S Furnitures & Merchandise. All rights reserved. | Bringing beauty to Filipino homes ✨
          </p>
          <p style={{ color: '#b6bab3', fontSize: '0.8em', fontFamily: '"Crimson Text", serif', marginTop: '0.5em' }}>
            Made with ❤️ for families who appreciate quality and style.
          </p>
        </div>
      </div>
    </footer>
  );
}
