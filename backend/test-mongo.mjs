import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();
const uri = process.env.MONGO_URI;

if (!uri) {
  console.error('No MONGO_URI set in .env');
  process.exit(1);
}

const client = new MongoClient(uri);

try {
  console.log('Connecting to MongoDB...');
  await client.connect();
  console.log('Connected successfully to MongoDB');
  const db = client.db();
  const cols = await db.listCollections().toArray();
  console.log('Collections:', cols.map(c => c.name));
} catch (err) {
  console.error('Connection error:', err.message);
  console.error(err);
} finally {
  await client.close();
  console.log('Closed connection');
}
