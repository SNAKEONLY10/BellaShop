import React, { useEffect, useRef, useState } from 'react';
import apiClient from '../api/client.js';
import { useNavigate } from 'react-router-dom';

export default function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('bella888@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const firstRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape' && isOpen) onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) return setError('Email and password are required');
    try {
      setLoading(true);
      const res = await apiClient.post('/api/auth/login', { email, password });
      const { token, admin } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('admin', JSON.stringify(admin));
      onClose();
      navigate('/admin-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        animation: 'fadeIn 0.25s ease-in-out'
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .login-modal { animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
      `}</style>
      
      <div 
        className="login-modal"
        style={{
          background: '#fff',
          borderRadius: '0.35em',
          padding: '3em',
          maxWidth: '420px',
          width: '95%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5em'}}>
          <h2 style={{margin:0,color:'#484d55',fontSize:'1.5em',fontWeight:700}}>KIMM'S Admin</h2>
          <button 
            onClick={onClose} 
            style={{
              background:'transparent',
              border:'none',
              cursor:'pointer',
              fontSize:'1.5em',
              color:'#919499',
              padding:0,
              width:'2em',
              height:'2em'
            }}
          >
            ✕
          </button>
        </div>
        
        <p style={{color:'#919499',marginBottom:'2em',lineHeight:'1.75em'}}>Manage inventory and products</p>

        {error && (
          <div style={{
            background:'#f4e4e4',
            color:'#B00020',
            padding:'0.75em 1em',
            borderRadius:'0.35em',
            marginBottom:'1.5em',
            fontSize:'0.9em'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={submit}>
          <div style={{marginBottom:'1.5em'}}>
            <label style={{display:'block',fontWeight:700,color:'#484d55',marginBottom:'0.5em',fontSize:'0.9em'}}>Email</label>
            <input 
              ref={firstRef}
              type="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              style={{
                display:'block',
                border:0,
                background:'#eee',
                boxShadow:'inset 0px 0px 1px 0px #a0a1a7',
                borderRadius:'0.35em',
                width:'100%',
                padding:'0.75em 1em',
                boxSizing:'border-box',
                fontFamily:"'Source Sans Pro',sans-serif",
                fontSize:'1em',
                transition:'all 0.25s ease-in-out',
                outline:0
              }}
              onFocus={(e) => e.target.style.background='#f8f8f8'}
              onBlur={(e) => e.target.style.background='#eee'}
            />
          </div>

          <div style={{marginBottom:'2em'}}>
            <label style={{display:'block',fontWeight:700,color:'#484d55',marginBottom:'0.5em',fontSize:'0.9em'}}>Password</label>
            <div style={{position:'relative',display:'flex',alignItems:'center'}}>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                style={{
                  display:'block',
                  border:0,
                  background:'#eee',
                  boxShadow:'inset 0px 0px 1px 0px #a0a1a7',
                  borderRadius:'0.35em',
                  width:'100%',
                  padding:'0.75em 1em',
                  paddingRight:'2.5em',
                  boxSizing:'border-box',
                  fontFamily:"'Source Sans Pro',sans-serif",
                  fontSize:'1em',
                  transition:'all 0.25s ease-in-out',
                  outline:0
                }}
                onFocus={(e) => e.target.style.background='#f8f8f8'}
                onBlur={(e) => e.target.style.background='#eee'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position:'absolute',
                  right:'0.75em',
                  background:'transparent',
                  border:'none',
                  cursor:'pointer',
                  fontSize:'1.1em',
                  color:'#919499',
                  padding:'0.5em',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center'
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              display:'inline-block',
              background:'#e97770',
              color:'#fff',
              textAlign:'center',
              textTransform:'uppercase',
              fontWeight:700,
              letterSpacing:'0.25em',
              borderRadius:'0.35em',
              border:0,
              outline:0,
              cursor:loading?'default':'pointer',
              padding:'0 2.25em',
              fontSize:'0.9em',
              minWidth:'12em',
              height:'4em',
              lineHeight:'4em',
              transition:'all 0.25s ease-in-out',
              opacity:loading?0.6:1,
              pointerEvents:loading?'none':'auto'
            }}
            onMouseEnter={(e) => !loading && (e.target.style.backgroundColor='#f98780')}
            onMouseLeave={(e) => (e.target.style.backgroundColor='#e97770')}
            onMouseDown={(e) => !loading && (e.target.style.backgroundColor='#d96760')}
            onMouseUp={(e) => !loading && (e.target.style.backgroundColor='#f98780')}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
