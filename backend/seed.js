import mongoose from 'mongoose';
import Admin from './models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

// Admin credentials
const adminData = {
  name: 'Bella Admin',
  email: 'Bella888@gmail.com',
  password: 'Bella888!'
};

async function seedAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bellashop');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('Admin already exists with this email. Updating password...');
      existingAdmin.password = adminData.password;
      await existingAdmin.save();
      console.log('✓ Admin password updated successfully');
    } else {
      // Create new admin
      const newAdmin = new Admin(adminData);
      await newAdmin.save();
      console.log('✓ Admin created successfully');
    }

    console.log('\n✓ Admin Credentials:');
    console.log(`  Email: ${adminData.email}`);
    console.log(`  Password: ${adminData.password}`);
    console.log('\nYou can now log in with these credentials in the admin dashboard.');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
}

seedAdmin();
