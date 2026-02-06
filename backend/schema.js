import { int, text, real, blob, integer } from 'drizzle-orm/sqlite-core';
import { sqliteTable } from 'drizzle-orm/sqlite-core';

export const admin = sqliteTable('admin', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(new Date()),
});

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  price: real('price').notNull(),
  category: text('category'),
  subcategory: text('subcategory'),
  condition: text('condition'),
  imageUrls: text('imageUrls'), // Stored as JSON string
  isFeatured: integer('isFeatured', { mode: 'boolean' }).default(false),
  isBestSeller: integer('isBestSeller', { mode: 'boolean' }).default(false),
  isHighlighted: integer('isHighlighted', { mode: 'boolean' }).default(false),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(new Date()),
});
