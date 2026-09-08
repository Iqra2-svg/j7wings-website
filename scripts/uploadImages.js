// scripts/uploadImages.js
//
// ONE-TIME SCRIPT — uploads every image in the `product-images/` folder to
// Firebase Storage, then updates that product's Firestore document with the
// resulting image URL.
//
// Setup before running:
//   1. Create a folder called `product-images` in your project root
//      (same level as `scripts/` and `src/`)
//   2. Put your product images inside it, named EXACTLY after the product's
//      Item# — the extension can be .jpg, .jpeg, .png, or .webp
//      e.g.  10001.jpg   20001.png   30003.jpeg
//   3. Run:  node scripts/uploadImages.js
//
// Safe to re-run: re-uploading an image just overwrites the same file in
// Storage and updates the same Firestore field, no duplicates.

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_FOLDER = path.join(__dirname, '..', 'product-images');

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
const storage = getStorage(app);

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

function getContentType(ext) {
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}

async function uploadImages() {
  if (!fs.existsSync(IMAGES_FOLDER)) {
    console.error(`Folder not found: ${IMAGES_FOLDER}`);
    console.error('Create a "product-images" folder in your project root and add your images first.');
    process.exit(1);
  }

  const files = fs.readdirSync(IMAGES_FOLDER).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return ALLOWED_EXTENSIONS.includes(ext);
  });

  if (files.length === 0) {
    console.log('No images found in product-images/. Nothing to upload.');
    process.exit(0);
  }

  console.log(`Found ${files.length} image(s). Starting upload...\n`);

  let successCount = 0;
  let failCount = 0;

  for (const fileName of files) {
    const ext = path.extname(fileName).toLowerCase();
    const itemNo = path.basename(fileName, ext); // e.g. "10001" from "10001.jpg"
    const filePath = path.join(IMAGES_FOLDER, fileName);

    try {
      const fileBuffer = fs.readFileSync(filePath);
      const storagePath = `products/${itemNo}${ext}`;
      const storageRef = ref(storage, storagePath);

      await uploadBytes(storageRef, fileBuffer, { contentType: getContentType(ext) });
      const downloadUrl = await getDownloadURL(storageRef);

      await updateDoc(doc(db, 'products', itemNo), { imageUrl: downloadUrl });

      successCount++;
      console.log(`✓ ${fileName} → uploaded and linked to product ${itemNo}`);
    } catch (err) {
      failCount++;
      console.error(`✗ ${fileName} — failed: ${err.message}`);
      console.error(`   (Check that a product with Item# "${itemNo}" exists in Firestore.)`);
    }
  }

  console.log(`\nDone! ${successCount} uploaded, ${failCount} failed.`);
  process.exit(0);
}

uploadImages();
