const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;

async function run() {
  if (!uri) {
    console.error('No MONGO_URI found in .env');
    process.exit(1);
  }

  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected successfully to MongoDB');
    const db = client.db();
    const collections = await db.collections();
    console.log('Collections:', collections.map(c => c.collectionName));
  } catch (err) {
    console.error('Connection error:', err.message);
    if (err.stack) console.error(err.stack);
  } finally {
    await client.close();
  }
}

run();
