import { db } from '../db.js';
import { admin } from '../schema.js';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

// POST /api/auth/login
// Finds admin by email, compares password, and returns a JWT on success.
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Login attempt:', email);

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const adminUsers = await db.select().from(admin).where(eq(admin.email, email.toLowerCase()));
    console.log('📝 Admin found:', adminUsers.length > 0 ? 'Yes' : 'No');
    
    if (adminUsers.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const adminUser = adminUsers[0];
    console.log('🔒 Comparing password...');
    const isMatch = await bcryptjs.compare(password, adminUser.password);
    console.log('✓ Password match:', isMatch);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: adminUser.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ 
      admin: { 
        id: adminUser.id, 
        name: adminUser.name, 
        email: adminUser.email 
      }, 
      token 
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export default login;
