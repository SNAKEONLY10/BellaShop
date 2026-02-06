import dotenv from 'dotenv';
dotenv.config();

import { db } from './db.js';
import { admin } from './schema.js';
import bcryptjs from 'bcryptjs';

async function resetAdmin() {
  try {
    console.log('Resetting admin credentials...\n');
    
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash('Bella888!', salt);
    
    // Delete existing admin
    await db.delete(admin);
    console.log('✓ Deleted old admin');
    
    // Create new admin
    await db.insert(admin).values({
      name: 'Bella Shop Admin',
      email: 'bella888@gmail.com',  // lowercase for consistency
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.log('✓ New admin created successfully\n');
    console.log('📝 USE THESE CREDENTIALS TO LOGIN:');
    console.log('   Email: bella888@gmail.com');
    console.log('   Password: Bella888!\n');
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

resetAdmin();
