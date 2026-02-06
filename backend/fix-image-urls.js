import mongoose from 'mongoose';
import Product from './models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixImageUrls() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    const products = await Product.find();
    let updated = 0;

    for (const product of products) {
      let needsUpdate = false;
      const newImageUrls = product.imageUrls.map(url => {
        if (url.startsWith('http://localhost:5000/uploads/')) {
          needsUpdate = true;
          return url.replace('http://localhost:5000', '');
        }
        return url;
      });

      if (needsUpdate) {
        await Product.findByIdAndUpdate(product._id, { imageUrls: newImageUrls });
        updated++;
        console.log(`✓ Updated: ${product.name}`);
      }
    }

    console.log(`\n✓ Fixed ${updated} products`);
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

fixImageUrls();
