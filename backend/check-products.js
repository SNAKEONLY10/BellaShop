import mongoose from 'mongoose';
import Product from './models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    const products = await Product.find().sort({ createdAt: -1 }).limit(5);
    
    console.log(`Total products: ${await Product.countDocuments()}\n`);
    
    products.forEach((p, i) => {
      console.log(`\n${i + 1}. ${p.name}`);
      console.log(`   Price: ₱${p.price}`);
      console.log(`   Image URLs:`, p.imageUrls);
      console.log(`   URL Count: ${p.imageUrls?.length || 0}`);
    });

    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkProducts();
