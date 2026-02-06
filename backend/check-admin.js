import dotenv from 'dotenv';
dotenv.config();

import { db } from './db.js';
import { admin } from './schema.js';

async function checkAdmin() {
  try {
    console.log('Checking admin in Turso...\n');
    
    const admins = await db.select().from(admin);
    
    if (admins.length === 0) {
      console.log('❌ No admin found in database');
    } else {
      console.log(`Found ${admins.length} admin(s):\n`);
      admins.forEach((a, i) => {
        console.log(`${i + 1}. Name: ${a.name}`);
        console.log(`   Email: ${a.email}`);
        console.log(`   Password Hash: ${a.password.substring(0, 30)}...`);
        console.log(`   Created: ${a.createdAt}\n`);
      });
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkAdmin();

checkAdmin();
