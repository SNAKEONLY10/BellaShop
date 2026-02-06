import React, { useState } from 'react';
import apiClient from '../api/client.js';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('Bella888@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) return setError('Email and password are required');

    try {
      setLoading(true);
      const res = await apiClient.post('/api/auth/login', { email, password });
      const { token, admin } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('admin', JSON.stringify(admin));
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="page-wrapper">
      <section className="wrapper style1" style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div className="container">
          <div style={{maxWidth:'420px',margin:'0 auto'}}>
            <div style={{background:'#fff',borderRadius:'0.35em',padding:'3em',boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>
              <h2 style={{textAlign:'center',marginBottom:'0.5em',color:'#484d55',fontWeight:700}}>Admin Access</h2>
              <p style={{textAlign:'center',color:'#919499',marginBottom:'2em'}}>Sign in to manage the Bella collection</p>

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

              <form onSubmit={handleSubmit}>
                <div style={{marginBottom:'1.5em'}}>
                  <label style={{display:'block',fontWeight:700,color:'#484d55',marginBottom:'0.5em'}}>Email</label>
                  <input
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
                  <label style={{display:'block',fontWeight:700,color:'#484d55',marginBottom:'0.5em'}}>Password</label>
                  <input
                    type="password"
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

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    display:'block',
                    width:'100%',
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
                    padding:'1em',
                    fontSize:'0.9em',
                    height:'4em',
                    lineHeight:'2em',
                    transition:'all 0.25s ease-in-out',
                    opacity:loading?0.6:1,
                    pointerEvents:loading?'none':'auto'
                  }}
                  onMouseEnter={(e) => !loading && (e.target.style.backgroundColor='#f98780')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor='#e97770')}
                  onMouseDown={(e) => !loading && (e.target.style.backgroundColor='#d96760')}
                  onMouseUp={(e) => !loading && (e.target.style.backgroundColor='#f98780')}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
