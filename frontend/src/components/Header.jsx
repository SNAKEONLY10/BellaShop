import React from 'react';
import { Link } from 'react-router-dom';

export default function Header({ onAdminClick }) {
  return (
    <header style={{
      position: 'fixed',
      top: 0,
      width: '100%',
      background: 'rgba(44, 44, 44, 0.95)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      padding: '1.25em 0',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      <div style={{
        maxWidth: '68em',
        margin: '0 auto',
        padding: '0 2em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* "K" Logo */}
        <Link to="/" style={{
          textDecoration: 'none',
          cursor: 'pointer'
        }}>
          <div style={{
            fontSize: '2.2em',
            fontWeight: 900,
            color: '#fff',
            fontFamily: '"Georgia", "Garamond", serif',
            letterSpacing: '-0.05em',
            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease',
            transform: 'scale(1)'
          }} 
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >K</div>
        </Link>

        {/* Navigation */}
        <nav style={{
          display: 'flex',
          gap: '3em',
          alignItems: 'center',
          listStyle: 'none',
          margin: 0,
          padding: 0
        }}>
          <Link to="/" style={{
            color: 'rgba(255,255,255,0.85)',
            textDecoration: 'none',
            fontSize: '0.9em',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 500,
            transition: 'color 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.color = '#fff'}
          onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.85)'}
          >Home</Link>

          <Link to="/shop" style={{
            color: 'rgba(255,255,255,0.85)',
            textDecoration: 'none',
            fontSize: '0.9em',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 500,
            transition: 'color 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.color = '#fff'}
          onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.85)'}
          >Shop</Link>

          {/* Admin Icon */}
          <button onClick={onAdminClick} style={{
            background: 'linear-gradient(135deg, #e97770 0%, #d95f56 100%)',
            border: 'none',
            borderRadius: '4px',
            padding: '0.6em 1.2em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            color: '#fff',
            fontSize: '0.75em',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            boxShadow: '0 4px 15px rgba(233, 119, 112, 0.25)',
            outline: 'none'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #f08878 0%, #e25f56 100%)';
            e.target.style.boxShadow = '0 6px 25px rgba(233, 119, 112, 0.35)';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #e97770 0%, #d95f56 100%)';
            e.target.style.boxShadow = '0 4px 15px rgba(233, 119, 112, 0.25)';
            e.target.style.transform = 'translateY(0)';
          }}
          title="Admin Login"
          >Admin</button>
        </nav>
      </div>
    </header>
  );
}
