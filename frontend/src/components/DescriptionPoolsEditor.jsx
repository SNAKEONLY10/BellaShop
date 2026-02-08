import React, { useEffect, useState } from 'react';
import apiClient from '../api/client.js';

export default function DescriptionPoolsEditor() {
  const [pools, setPools] = useState({});
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchPools();
  }, []);

  const fetchPools = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/products/admin/description-pools', { headers: { Authorization: `Bearer ${token}` } });
      setPools(res.data || {});
    } catch (err) {
      console.error('Error fetching pools, falling back to localStorage:', err);
      const local = localStorage.getItem('descriptionPools');
      setPools(local ? JSON.parse(local) : {});
    } finally {
      setLoading(false);
    }
  };

  const updatePoolsLocal = (newPools) => {
    setPools(newPools);
    localStorage.setItem('descriptionPools', JSON.stringify(newPools));
  };

  const handleSave = async () => {
    try {
      await apiClient.put('/api/products/admin/description-pools', pools, { headers: { Authorization: `Bearer ${token}` } });
      // also save locally
      localStorage.setItem('descriptionPools', JSON.stringify(pools));
      alert('Pools saved');
    } catch (err) {
      console.error('Error saving pools to server, saved locally instead', err);
      localStorage.setItem('descriptionPools', JSON.stringify(pools));
      alert('Saved locally (server error)');
    }
  };

  const addCategory = () => {
    const name = prompt('New category key (e.g., Sofa)');
    if (!name) return;
    const key = name.trim();
    if (pools[key]) return alert('Category exists');
    const np = { ...pools, [key]: [''] };
    updatePoolsLocal(np);
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h2 style={{ marginTop: 0 }}>Description Pools</h2>
      <p style={{ color: '#6b7280' }}>Edit category sentence pools used by the auto-generator. Changes are saved to the server if available, and locally as fallback.</p>
      <div style={{ margin: '1.2em 0' }}>
        <button onClick={addCategory} style={{ marginRight: 8 }}>+ Add Category</button>
        <button onClick={handleSave}>Save Pools</button>
      </div>
      {loading ? <div>Loading...</div> : (
        Object.keys(pools).length === 0 ? (
          <div>No pools defined yet.</div>
        ) : (
          Object.keys(pools).map((cat) => (
            <div key={cat} style={{ marginBottom: '1em', padding: '0.8em', border: '1px solid #eee', borderRadius: 8 }}>
              <h4 style={{ margin: '0 0 0.6em 0' }}>{cat}</h4>
              {(pools[cat] || []).map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input value={s} onChange={(e) => { const next = { ...pools, [cat]: pools[cat].slice() }; next[cat][i] = e.target.value; updatePoolsLocal(next); }} style={{ flex: 1 }} />
                  <button onClick={() => { const next = { ...pools, [cat]: pools[cat].filter((_, idx) => idx !== i) }; updatePoolsLocal(next); }}>Remove</button>
                </div>
              ))}
              <div>
                <button onClick={() => { const next = { ...pools, [cat]: [...(pools[cat]||[]), ''] }; updatePoolsLocal(next); }}>+ Add sentence</button>
              </div>
            </div>
          ))
        )
      )}
    </div>
  );
}
