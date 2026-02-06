# Best Sellers / Featured Slider – Implementation Guide

## Overview
The slider feature displays products in a smooth horizontal scrolling carousel on the **Home Page** and integrates with the **Admin Dashboard** for easy management.

---

## 📱 Components

### 1. **FeaturedSlider.jsx** (`frontend/src/components/`)
**Reusable horizontal slider component**

- **Props:**
  - `items` (array): Product list to display
  - `onOpen` (function): Callback when a product card is clicked

- **Features:**
  - Smooth horizontal scroll with left/right arrow buttons
  - Hover animations (card lift, image zoom)
  - Responsive: Cards adjust width on mobile
  - Auto-scroll behavior with `scrollBehavior: 'smooth'`

**Usage Example:**
```jsx
<FeaturedSlider items={products} onOpen={(product) => setSelectedProduct(product)} />
```

---

### 2. **ProductModal.jsx** (`frontend/src/components/`)
**Product details modal**

- **Props:**
  - `product` (object): Product data
  - `currentIndex` (number): Current image index
  - `setIndex` (function): Change active image
  - `onClose` (function): Close modal

- **Features:**
  - Large product image
  - Thumbnail gallery (click to change image)
  - Product name, category, condition, price, description
  - "Message on Facebook" CTA button
  - Grid layout: image left, details right

**Usage Example:**
```jsx
{openProduct && (
  <ProductModal
    product={openProduct}
    currentIndex={index}
    setIndex={setIndex}
    onClose={() => setOpenProduct(null)}
  />
)}
```

---

## 🏠 Home Page Integration

### Best Sellers Section
- Displays products marked as "Best Sellers" (`isBestSeller = true`)
- Uses horizontal slider with smooth scroll
- Click any product → Opens ProductModal

### Featured Section
- Displays products marked as "Featured" (`isFeatured = true`)
- Same slider layout as Best Sellers section

```jsx
// Home.jsx
const [openProduct, setOpenProduct] = useState(null);
const [productImageIndex, setProductImageIndex] = useState(0);

// In JSX:
<FeaturedSlider 
  items={bestSellerProducts} 
  onOpen={(p) => { 
    setProductImageIndex(0); 
    setOpenProduct(p); 
  }} 
/>

{openProduct && (
  <ProductModal
    product={openProduct}
    currentIndex={productImageIndex}
    setIndex={setProductImageIndex}
    onClose={() => setOpenProduct(null)}
  />
)}
```

---

## ⚙️ Admin Dashboard – Featured Manager

### Location: Admin → ⭐ Featured Tab

### Features:

#### 1. **Featured Slider Preview**
- Shows all currently featured products in a slider
- Admins can see how products will appear on the home page
- Preview updates in real-time when products are added/removed

#### 2. **All Products Grid**
- Lists all available products from inventory
- Each card shows:
  - Product image
  - Name, category, price
  - Button to "Add to Featured" or "★ Remove from Featured"
  
#### 3. **Visual Indicators**
- Featured products highlighted with:
  - Rose border (`#f4a9a8`)
  - Light background (`#fff8f7`)

### Example UI Flow:
```
1. Admin goes to Dashboard → ⭐ Featured tab
2. Sees current featured products in a slider at top
3. Scrolls down to see all products in grid
4. Clicks "☆ Add to Featured" on any product
5. Product immediately appears in the slider preview
6. Home page automatically shows the new featured product
```

---

## 🔗 Backend Endpoints Used

```javascript
// Routes: /api/products

GET /api/products/featured
// Returns: Array of products with isFeatured = true

PATCH /api/products/:id/toggle-featured
// Toggle featured status for a product
// Required: Authorization header with admin token

GET /api/products/bestsellers
// Returns: Array of products with isBestSeller = true

PATCH /api/products/:id/toggle-bestseller
// Toggle best seller status for a product
```

---

## 🎨 Design & Styling

### Color Scheme:
- **Primary Rose**: `#f4a9a8`
- **Dark Green**: `#4a5d52`
- **Light Bg**: `linear-gradient(135deg, #faf9f7, #f5f3f0)`
- **White**: `#fff`

### Fonts:
- **Headings**: `"Playfair Display", serif`
- **Body**: `"Crimson Text", serif`

### Animations:
- **Scroll**: `scrollBehavior: 'smooth'` (CSS)
- **Card Hover**: `translateY(-6px)` with enhanced shadow
- **Image Hover**: `scale(1.15) rotate(3deg)`
- **Button Hover**: Smooth color/transform transitions

---

## 📋 Admin Product Form Updates

### New Fields Added:
1. **Subcategory** (optional text field)
2. **Condition** (dropdown: New, Like New, Used, Well-Used)

These fields help categorize and describe surplus furniture conditions.

---

## 🚀 Usage Instructions

### For Customers:
1. **On Home Page**: See "🌟 Best Sellers" and featured products in sliders
2. **Click any product**: Opens modal with full details, gallery, and Facebook message link
3. **View gallery**: Click thumbnails to see different angles of the product

### For Admin:
1. **Add products** in "✨ Add New" tab (include images, price, category, condition)
2. **Manage featured** in "⭐ Featured" tab
   - Click "☆ Add to Featured" to add to home slider
   - Click "★ Remove from Featured" to remove
   - See live preview in slider at top
3. **Products auto-appear** on home page immediately after being featured

---

## ☑️ Responsive Design

- **Desktop**: Full slider visible with smooth arrows
- **Tablet**: Cards adjust, arrows stay accessible
- **Mobile**: Horizontal scroll with touch support (`WebkitOverflowScrolling: 'touch'`)

---

## 🔧 Troubleshooting

**Q: Slider not showing?**
- Check: Are any products marked as featured/best seller? (Empty = no slider)
- Check: Products need valid `imageUrls` array for display

**Q: Images not loading?**
- Check: Image URLs are valid and accessible
- Check: CORS headers if using external URLs

**Q: Modal not opening?**
- Check: Product object has `id` or `_id` field
- Check: State management (check React DevTools)

---

## 📝 Files Modified/Created

**Created:**
- `frontend/src/components/FeaturedSlider.jsx`
- `frontend/src/components/ProductModal.jsx`

**Updated:**
- `frontend/src/pages/Home.jsx` (integrated slider + modal)
- `frontend/src/pages/FeaturedManager.jsx` (enhanced with slider preview)
- `frontend/src/pages/AdminDashboard.jsx` (added condition/subcategory fields)
- Backend routes/controllers (already existed — toggle-featured, toggle-bestseller)

---

## ✨ Future Enhancements

- Auto-play carousel (if needed)
- Product search/filter in admin
- Drag-to-scroll on mobile
- Multiple featured collections/categories
- Analytics on slider click-through rates

---

**Last Updated:** Feb 6, 2025  
**Build Status:** ✅ Passing
