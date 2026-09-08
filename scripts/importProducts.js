// scripts/importProducts.js
//
// ONE-TIME SCRIPT — run this once from your terminal to load the 25 dummy
// products into your Firestore "products" collection.
//
// How to run:
//   1. Make sure you're in your project's root folder (where package.json is)
//   2. Run:  node scripts/importProducts.js
//   3. Wait for it to finish — it will print each product as it's added
//   4. Check Firebase Console → Firestore Database → "products" collection
//
// Safe to re-run: each product uses its Item# as the document ID, so running
// this twice just overwrites the same 25 documents instead of duplicating them.

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Same config as src/firebase.js
const firebaseConfig = {
  apiKey: 'AIzaSyDwBy46j19VJ_PrPUhWLWZzJnzq96x6bj4',
  authDomain: 'j7wings-1f29d.firebaseapp.com',
  projectId: 'j7wings-1f29d',
  storageBucket: 'j7wings-1f29d.firebasestorage.app',
  messagingSenderId: '171779292763',
  appId: '1:171779292763:web:5a38b98cb4468ba38c897e',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// The same 25 dummy products from dummy_products.xlsx
const products = [
  { itemNo: '10001', category: 'T-Shirts', subCategory: "Men's T-Shirts", name: "Men's Crew Neck Cotton T-Shirt, Assorted Colors", price: 3.50, cp: 12, stockStatus: 'in', qoh: 336 },
  { itemNo: '10002', category: 'T-Shirts', subCategory: "Men's T-Shirts", name: "Men's V-Neck T-Shirt, Black", price: 3.75, cp: 12, stockStatus: 'in', qoh: 220 },
  { itemNo: '10003', category: 'T-Shirts', subCategory: "Women's T-Shirts", name: "Women's Fitted T-Shirt, Assorted Colors", price: 3.90, cp: 12, stockStatus: 'in', qoh: 204 },
  { itemNo: '10004', category: 'T-Shirts', subCategory: "Women's T-Shirts", name: "Women's Scoop Neck Tee, White", price: 4.00, cp: 12, stockStatus: 'low', qoh: 18 },
  { itemNo: '10005', category: 'T-Shirts', subCategory: 'Kids T-Shirts', name: 'Kids Cotton T-Shirt, Assorted Sizes', price: 2.75, cp: 24, stockStatus: 'in', qoh: 288 },
  { itemNo: '10006', category: 'T-Shirts', subCategory: 'Kids T-Shirts', name: 'Kids Graphic Print Tee, Assorted', price: 3.00, cp: 24, stockStatus: 'in', qoh: 264 },
  { itemNo: '10007', category: 'T-Shirts', subCategory: 'Graphic Tees', name: 'Unisex Graphic Print T-Shirt, Assorted Designs', price: 4.25, cp: 12, stockStatus: 'in', qoh: 144 },
  { itemNo: '10008', category: 'T-Shirts', subCategory: 'Plain/Basic Tees', name: 'Unisex Basic Crew Tee, Bulk Pack', price: 3.25, cp: 24, stockStatus: 'in', qoh: 312 },

  { itemNo: '20001', category: 'Shoes', subCategory: "Men's Shoes", name: "Men's Casual Sneakers, Assorted Sizes", price: 12.50, cp: 6, stockStatus: 'low', qoh: 18 },
  { itemNo: '20002', category: 'Shoes', subCategory: "Men's Shoes", name: "Men's Slip-On Loafers, Black", price: 14.00, cp: 6, stockStatus: 'in', qoh: 60 },
  { itemNo: '20003', category: 'Shoes', subCategory: "Women's Shoes", name: "Women's Flat Shoes, Assorted Colors", price: 11.00, cp: 6, stockStatus: 'in', qoh: 72 },
  { itemNo: '20004', category: 'Shoes', subCategory: "Women's Shoes", name: "Women's Ankle Boots, Brown", price: 15.50, cp: 6, stockStatus: 'in', qoh: 36 },
  { itemNo: '20005', category: 'Shoes', subCategory: 'Kids Shoes', name: 'Kids Running Shoes, Assorted Sizes', price: 9.00, cp: 12, stockStatus: 'in', qoh: 96 },
  { itemNo: '20006', category: 'Shoes', subCategory: 'Sports/Sneakers', name: 'Unisex Sports Sneakers, Assorted', price: 13.75, cp: 6, stockStatus: 'in', qoh: 48 },
  { itemNo: '20007', category: 'Shoes', subCategory: 'Sandals', name: "Men's Flip Flop Sandals, Assorted Sizes", price: 4.50, cp: 12, stockStatus: 'in', qoh: 156 },
  { itemNo: '20008', category: 'Shoes', subCategory: 'Sandals', name: "Women's Strappy Sandals, Assorted Colors", price: 6.00, cp: 12, stockStatus: 'in', qoh: 108 },

  { itemNo: '30001', category: 'Crockery', subCategory: 'Plates', name: 'Ceramic Dinner Plate, 10 inch, White', price: 2.25, cp: 24, stockStatus: 'in', qoh: 288 },
  { itemNo: '30002', category: 'Crockery', subCategory: 'Bowls', name: 'Ceramic Soup Bowl, Assorted Colors', price: 1.75, cp: 24, stockStatus: 'in', qoh: 240 },
  { itemNo: '30003', category: 'Crockery', subCategory: 'Dinner Sets', name: '16-Piece Dinnerware Set, White', price: 22.00, cp: 2, stockStatus: 'out', qoh: 0 },
  { itemNo: '30004', category: 'Crockery', subCategory: 'Dinner Sets', name: '12-Piece Melamine Dinner Set, Assorted', price: 18.50, cp: 4, stockStatus: 'in', qoh: 32 },
  { itemNo: '30005', category: 'Crockery', subCategory: 'Serving Platters', name: 'Oval Serving Platter, Ceramic, 14 inch', price: 5.50, cp: 6, stockStatus: 'in', qoh: 48 },

  { itemNo: '40001', category: 'Crockery', subCategory: 'Drinking Glasses', name: 'Clear Glass Tumbler Set, 6-Piece', price: 6.00, cp: 8, stockStatus: 'in', qoh: 64 },
  { itemNo: '40002', category: 'Crockery', subCategory: 'Mugs', name: 'Ceramic Coffee Mug, 11oz, Assorted Colors', price: 1.50, cp: 36, stockStatus: 'in', qoh: 540 },
  { itemNo: '40003', category: 'Crockery', subCategory: 'Mugs', name: 'Printed Ceramic Mug, Assorted Designs', price: 1.95, cp: 36, stockStatus: 'in', qoh: 396 },
  { itemNo: '40004', category: 'Crockery', subCategory: 'Tea Sets', name: '6-Piece Porcelain Tea Set', price: 5.00, cp: 40, stockStatus: 'in', qoh: 80 },
  { itemNo: '40005', category: 'Crockery', subCategory: 'Cups & Saucers', name: 'Cup and Saucer Set, 4-Piece, White', price: 7.25, cp: 6, stockStatus: 'in', qoh: 42 },
];

async function importProducts() {
  console.log(`Starting import of ${products.length} products...\n`);
  let count = 0;
  for (const product of products) {
    try {
      await setDoc(doc(db, 'products', product.itemNo), product);
      count++;
      console.log(`✓ [${count}/${products.length}] ${product.itemNo} — ${product.name}`);
    } catch (err) {
      console.error(`✗ Failed to add ${product.itemNo}:`, err.message);
    }
  }
  console.log(`\nDone! ${count} of ${products.length} products imported.`);
  process.exit(0);
}

importProducts();
