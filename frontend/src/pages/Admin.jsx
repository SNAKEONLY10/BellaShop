import React, { useEffect, useState } from 'react';
import apiClient from '../api/client.js';
import { useNavigate } from 'react-router-dom';

// Clean admin dashboard with sidebar, header, stats, and logout
export default function Admin() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, available: 0, sold: 0 });
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    navigate('/login');
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await apiClient.get('/api/products/stats/overview', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setStats({ total: 0, available: 0, sold: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const admin = JSON.parse(localStorage.getItem('admin') || 'null');

  return (
    <div className="admin-wrap">
      <div className="admin-grid">
        <aside className="sidebar">
          <div className="brand">BellaShop</div>
          <div className="muted">Admin</div>
          <nav style={{marginTop:12}}>
            <button onClick={() => navigate('/admin')}>Home</button>
            <button onClick={() => navigate('/admin/products')}>Products</button>
          </nav>
          <div style={{marginTop:16}}>
            <button onClick={handleLogout} className="btn btn-danger" style={{width:'100%'}}>Logout</button>
          </div>
        </aside>

        <main>
          <div className="card">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <h1 style={{margin:0}}>Dashboard</h1>
                <div className="muted">Overview of your store</div>
              </div>
              <div className="muted">Signed in as <strong>{admin?.email || 'admin'}</strong></div>
            </div>

            <div className="grid-3 mt-4">
              <div className="card">
                <div className="muted">Products</div>
                <div style={{fontSize:22,fontWeight:700}}>{loading ? '...' : productsCount}</div>
              </div>
              <div className="card">
                <div className="muted">Inquiries</div>
                <div style={{fontSize:22,fontWeight:700}}>—</div>
              </div>
            </div>

            <div className="mt-4 muted">This dashboard is a simple management area. Product creation and uploads will be added here.</div>
          </div>
        </main>
      </div>
    </div>
  );
}
