import { db } from '../db.js';

// Simple controller to get and update description pools stored in DB
export const getDescriptionPools = async (req, res) => {
  try {
    const rows = await db.run(`SELECT category, sentences FROM description_pools`);
    // Normalize result
    const list = (rows && rows.rows) ? rows.rows : (Array.isArray(rows) ? rows : []);
    const map = {};
    list.forEach(r => {
      try { map[r.category] = JSON.parse(r.sentences || '[]'); } catch (e) { map[r.category] = []; }
    });
    res.json(map);
  } catch (err) {
    console.error('Error getting description pools:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const upsertDescriptionPools = async (req, res) => {
  try {
    const payload = req.body || {};
    // payload: { category: [sentences] }
    const keys = Object.keys(payload);
    for (const k of keys) {
      const sentences = JSON.stringify(Array.isArray(payload[k]) ? payload[k] : []);
      // upsert: delete then insert (sqlite simple)
      await db.run(`DELETE FROM description_pools WHERE category = ?`, [k]);
      await db.run(`INSERT INTO description_pools (category, sentences) VALUES (?, ?)` , [k, sentences]);
    }
    res.json({ message: 'Pools updated' });
  } catch (err) {
    console.error('Error updating pools:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
