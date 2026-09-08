import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import '../styles/AdminProductForm.css';

const INITIAL_SUB_CATEGORIES = {
  'T-Shirts': ["Men's T-Shirts", "Women's T-Shirts", 'Kids T-Shirts', 'Graphic Tees', 'Plain/Basic Tees'],
  Shoes: ["Men's Shoes", "Women's Shoes", 'Kids Shoes', 'Sports/Sneakers', 'Sandals'],
  Crockery: ['Plates', 'Bowls', 'Dinner Sets', 'Serving Platters', 'Drinking Glasses', 'Mugs', 'Tea Sets', 'Cups & Saucers'],
};

export default function AdminProductForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // present when route is /admin/products/:id/edit, undefined on /new
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [showNewMainCat, setShowNewMainCat] = useState(false);
  const [newMainCatName, setNewMainCatName] = useState('');

  // Categories start from the defaults above, but admins can add more —
  // both lists live in state so new ones persist for the rest of this session.
  const [subCategoriesMap, setSubCategoriesMap] = useState(INITIAL_SUB_CATEGORIES);
  const mainCategoryOptions = Object.keys(subCategoriesMap);

  // Form fields
  const [itemNo, setItemNo] = useState('');
  const [mainCategory, setMainCategory] = useState('T-Shirts');
  const [subCategory, setSubCategory] = useState(INITIAL_SUB_CATEGORIES['T-Shirts'][0]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [cp, setCp] = useState('');
  const [description, setDescription] = useState('');
  const [qty, setQty] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('20');
  const [stockStatus, setStockStatus] = useState('in'); // 'in' | 'low' | 'out'
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isSpecial, setIsSpecial] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageError('');

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setImageError('Please upload a JPG, PNG, or WEBP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image must be under 5MB.');
      return;
    }
    if (!itemNo.trim()) {
      setImageError('Enter the Item # first, then upload the image.');
      return;
    }

    setUploadingImage(true);
    try {
      const ext = file.name.split('.').pop().toLowerCase();
      const storageRef = ref(storage, `products/${itemNo.trim()}.${ext}`);
      await uploadBytes(storageRef, file, { contentType: file.type });
      const url = await getDownloadURL(storageRef);
      setExistingImageUrl(url);
    } catch (err) {
      console.error('Image upload failed:', err);
      setImageError('Upload failed. Please try again.');
    }
    setUploadingImage(false);
  };

  // In edit mode, load the existing product and fill every field.
  useEffect(() => {
    if (!isEditMode) return;
    async function fetchProduct() {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, 'products', id));
        if (snap.exists()) {
          const d = snap.data();
          setItemNo(d.itemNo || id);
          setMainCategory(d.category || 'T-Shirts');
          setSubCategory(d.subCategory || subCategoriesMap[d.category]?.[0] || '');
          // If this product's category isn't one of the known ones (e.g. it was
          // added directly in Firestore), register it so the dropdowns show it.
          if (d.category && !subCategoriesMap[d.category]) {
            setSubCategoriesMap((prev) => ({ ...prev, [d.category]: d.subCategory ? [d.subCategory] : [] }));
          }
          setName(d.name || '');
          setPrice(d.price != null ? String(d.price) : '');
          setCp(d.cp != null ? String(d.cp) : '');
          setDescription(d.description || '');
          setQty(d.qoh != null ? String(d.qoh) : '');
          setLowStockThreshold(d.lowStockThreshold != null ? String(d.lowStockThreshold) : '20');
          setStockStatus(d.stockStatus || 'in');
          setIsNewArrival(Boolean(d.isNewArrival));
          setIsSpecial(Boolean(d.isSpecial));
          setIsBestSeller(Boolean(d.isBestSeller));
          setExistingImageUrl(d.imageUrl || null);
        } else {
          alert('Product not found.');
          navigate('/admin/dashboard');
        }
      } catch (err) {
        console.error('Failed to load product:', err);
      }
      setLoading(false);
    }
    fetchProduct();
  }, [id, isEditMode, navigate]);

  // Mirrors the original checkQty() + setStock() logic:
  // typing 0 auto-selects "Out of Stock", and picking "Out of Stock" zeroes the qty field.
  const handleQtyChange = (e) => {
    const val = e.target.value;
    setQty(val);
    const num = parseInt(val, 10) || 0;
    if (num === 0) {
      setStockStatus('out');
    } else if (stockStatus === 'out') {
      setStockStatus('in');
    }
  };

  const handleStockSelect = (status) => {
    setStockStatus(status);
    if (status === 'out') {
      setQty('0');
    }
  };

  const handleMainCategoryChange = (e) => {
    const cat = e.target.value;
    setMainCategory(cat);
    setSubCategory(subCategoriesMap[cat]?.[0] || '');
  };

  const handleAddNewMainCategory = () => {
    if (!newMainCatName.trim()) return;
    const cat = newMainCatName.trim();
    setSubCategoriesMap((prev) => (prev[cat] ? prev : { ...prev, [cat]: [] }));
    setMainCategory(cat);
    setSubCategory('');
    setNewMainCatName('');
    setShowNewMainCat(false);
  };

  const handleAddNewSubCategory = () => {
    if (!newCatName.trim()) return;
    const sub = newCatName.trim();
    setSubCategoriesMap((prev) => {
      const existing = prev[mainCategory] || [];
      if (existing.includes(sub)) return prev;
      return { ...prev, [mainCategory]: [...existing, sub] };
    });
    setSubCategory(sub);
    setNewCatName('');
    setShowNewCat(false);
  };

  const handleCancel = () => {
    navigate('/admin/dashboard');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!itemNo.trim() || !name.trim() || !price || !cp) {
      alert('Please fill in Item #, Product Name, Price, and Case Pack before saving.');
      return;
    }

    setSaving(true);
    try {
      const productData = {
        itemNo: itemNo.trim(),
        category: mainCategory,
        subCategory,
        name: name.trim(),
        price: parseFloat(price),
        cp: parseInt(cp, 10),
        description: description.trim(),
        qoh: parseInt(qty, 10) || 0,
        lowStockThreshold: parseInt(lowStockThreshold, 10) || 20,
        stockStatus,
        isNewArrival,
        isSpecial,
        isBestSeller,
        imageUrl: existingImageUrl || null,
      };

      // Using the Item# as the document ID keeps this consistent with the
      // Firestore import script — setDoc creates it if new, overwrites if editing.
      await setDoc(doc(db, 'products', itemNo.trim()), productData);
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Failed to save product:', err);
      alert('Failed to save product. Please try again.');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete product #${itemNo}? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Failed to delete product. Please try again.');
    }
  };

  const showQtyWarning = stockStatus === 'out';

  if (loading) {
    return (
      <div className="shell">
        <main className="main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#8A8577', fontFamily: 'IBM Plex Mono, monospace' }}>Loading product&hellip;</p>
        </main>
      </div>
    );
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link to="/admin/dashboard" className="side-logo">
          <div className="logo-mark">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 12L11 9L12 2L13 9L22 12L13 15L12 22L11 15L2 12Z" fill="#16233F" />
            </svg>
          </div>
          <div>
            <div className="t">J7 WINGS</div>
            <div className="s">Admin Console</div>
          </div>
        </Link>
        <div className="nav-group">
          <div className="nav-label">Overview</div>
          <Link to="/admin/dashboard" className="nav-item">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M3 13H10V3H3V13ZM3 21H10V15H3V21ZM12 21H21V11H12V21ZM12 3V9H21V3H12Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            </svg>
            Dashboard
          </Link>
        </div>
        <div className="nav-group">
          <div className="nav-label">Catalog</div>
          <Link to="/admin/dashboard" className="nav-item active">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M3 7L12 3L21 7M3 7L12 11M3 7V17L12 21M21 7L12 11M21 7V17L12 21M12 11V21" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            </svg>
            Products
          </Link>
          <div className="nav-item">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M6 9H4L2 5H1M6 9L4.6 15.6C4.5 16.3 5.1 17 5.8 17H17.3C18 17 18.5 16.3 18.4 15.6L16 5H6M6 9H16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Orders
          </div>
          <div className="nav-item">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M17 21V19C17 16.79 15.21 15 13 15H5C2.79 15 1 16.79 1 19V21M23 21V19C23 17.13 21.73 15.56 20 15.11M16 3.11C17.73 3.56 19 5.13 19 7C19 8.87 17.73 10.44 16 10.89M13 7C13 9.21 11.21 11 9 11C6.79 11 5 9.21 5 7C5 4.79 6.79 3 9 3C11.21 3 13 4.79 13 7Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Customers
          </div>
        </div>
        <div className="sidebar-foot">
          <div className="admin-chip">
            <div className="admin-avatar">IQ</div>
            <div>
              <div className="admin-name">Iqra Shah</div>
              <div className="admin-role">SUPER ADMIN</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="breadcrumb-row">
          <Link to="/admin/dashboard">Dashboard</Link> / <Link to="/admin/dashboard">Products</Link> /{' '}
          <span style={{ color: 'var(--navy)', fontWeight: 600 }}>{isEditMode ? 'Edit Product' : 'Add Product'}</span>
        </div>

        <form onSubmit={handleSave}>
          <div className="topbar">
            <div>
              <h1>Add / Edit Product</h1>
              <div className="mode-tag">
                {isEditMode ? `// Editing: ITEM #${itemNo}` : '// Editing: NEW PRODUCT — not yet saved'}
              </div>
            </div>
            <div className="top-actions">
              <button type="button" className="apf-btn-outline" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </div>

          <div className="form-card">
            <h3>
              <span className="num">1</span> Category
            </h3>
            <p className="card-sub">Choose an existing category, or add a new main category or sub-category if it doesn't exist yet.</p>
            <div className="apf-field-row">
              <div className="apf-field">
                <label>
                  Main Category
                  <span className="add-new-link" onClick={() => setShowNewMainCat((v) => !v)}>
                    + Add New Category
                  </span>
                </label>
                <select value={mainCategory} onChange={handleMainCategoryChange}>
                  {mainCategoryOptions.map((cat) => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="apf-field">
                <label>
                  Sub-Category
                  <span className="add-new-link" onClick={() => setShowNewCat((v) => !v)}>
                    + Add New Sub-Category
                  </span>
                </label>
                <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)}>
                  {(subCategoriesMap[mainCategory] || []).map((sc) => (
                    <option key={sc}>{sc}</option>
                  ))}
                  {subCategory && !subCategoriesMap[mainCategory]?.includes(subCategory) && <option>{subCategory}</option>}
                </select>
              </div>

              <div className={`new-cat-box${showNewMainCat ? ' show' : ''}`}>
                <div className="apf-field">
                  <label>New Main Category Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Home Textiles"
                    value={newMainCatName}
                    onChange={(e) => setNewMainCatName(e.target.value)}
                  />
                </div>
                <button type="button" onClick={handleAddNewMainCategory}>
                  Use This Category
                </button>
              </div>

              <div className={`new-cat-box${showNewCat ? ' show' : ''}`}>
                <div className="apf-field">
                  <label>New Sub-Category Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Long Sleeve Tees"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                  />
                </div>
                <button type="button" onClick={handleAddNewSubCategory}>
                  Use This Sub-Category
                </button>
              </div>
            </div>
          </div>

          <div className="form-card">
            <h3>
              <span className="num">2</span> Product Information
            </h3>
            <p className="card-sub">Basic details shown to buyers on the product page.</p>
            <div className="apf-field-row">
              <div className="apf-field full">
                <label>Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Men's Crew Neck Cotton Tee, Assorted Colors"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
            <div className="apf-field-row three">
              <div className="apf-field">
                <label>Item # (SKU)</label>
                <input
                  type="text"
                  placeholder="10009"
                  value={itemNo}
                  onChange={(e) => setItemNo(e.target.value)}
                  readOnly={isEditMode}
                  style={isEditMode ? { background: '#F3F1EC', color: '#8A8577' } : undefined}
                />
              </div>
              <div className="apf-field">
                <label>Price ($ per unit)</label>
                <input type="text" placeholder="3.50" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
              <div className="apf-field">
                <label>Case Pack (CP)</label>
                <input type="text" placeholder="12" value={cp} onChange={(e) => setCp(e.target.value)} />
              </div>
            </div>
            <div className="apf-field-row">
              <div className="apf-field full">
                <label>Description</label>
                <textarea
                  rows="3"
                  placeholder="Short description shown on the product detail page&hellip;"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-card">
            <h3>
              <span className="num">3</span> Product Images
            </h3>
            <p className="card-sub">
              Upload one image for this product (JPG, PNG, or WEBP, up to 5MB). Make sure the{' '}
              <strong>Item #</strong> above is filled in first &mdash; the image is stored under that
              number.
            </p>

            <label
              className="upload-zone"
              htmlFor="productImageInput"
              style={{ cursor: uploadingImage ? 'wait' : 'pointer', opacity: uploadingImage ? 0.6 : 1 }}
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 16V4M12 4L7 9M12 4L17 9M4 20H20" stroke="#16233F" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="t1">{uploadingImage ? 'Uploading&hellip;' : 'Click to upload'}</div>
              <div className="t2">JPG, PNG, or WEBP up to 5MB</div>
            </label>
            <input
              id="productImageInput"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageSelect}
              disabled={uploadingImage}
              style={{ display: 'none' }}
            />

            {imageError && (
              <p style={{ color: '#C0392B', fontSize: '12.5px', marginTop: '10px', fontFamily: 'IBM Plex Mono, monospace' }}>
                {imageError}
              </p>
            )}

            {existingImageUrl && (
              <div className="thumb-preview-row">
                <div className="thumb-preview">
                  <img src={existingImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div className="rm" onClick={() => setExistingImageUrl(null)}>
                    &times;
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="form-card">
            <h3>
              <span className="num">4</span> Inventory &amp; Stock Status
            </h3>
            <p className="card-sub">
              Set the quantity on hand and mark availability &mdash; you can update this anytime a
              product runs out.
            </p>
            <div className="apf-field-row">
              <div className="apf-field">
                <label>Quantity on Hand (units)</label>
                <input type="text" placeholder="0" value={qty} onChange={handleQtyChange} />
              </div>
              <div className="apf-field">
                <label>Low Stock Threshold</label>
                <input
                  type="text"
                  placeholder="20"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                />
                <span className="apf-field-hint">Alerts you on the dashboard below this number</span>
              </div>
            </div>

            <div className="apf-field full" style={{ marginTop: '6px' }}>
              <label>Stock Status</label>
              <div className="stock-toggle-group">
                <label className={`stock-option in${stockStatus === 'in' ? ' selected' : ''}`}>
                  <input type="radio" name="stock" checked={stockStatus === 'in'} onChange={() => handleStockSelect('in')} />
                  <div className="dot"></div>
                  <div className="lbl">IN STOCK</div>
                </label>
                <label className={`stock-option low${stockStatus === 'low' ? ' selected' : ''}`}>
                  <input type="radio" name="stock" checked={stockStatus === 'low'} onChange={() => handleStockSelect('low')} />
                  <div className="dot"></div>
                  <div className="lbl">LOW STOCK</div>
                </label>
                <label className={`stock-option out${stockStatus === 'out' ? ' selected' : ''}`}>
                  <input type="radio" name="stock" checked={stockStatus === 'out'} onChange={() => handleStockSelect('out')} />
                  <div className="dot"></div>
                  <div className="lbl">OUT OF STOCK</div>
                </label>
              </div>
            </div>

            <div className={`qty-warning${showQtyWarning ? ' show' : ''}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18C1.64 18.32 1.55 18.68 1.55 19.04C1.55 20.13 2.43 21 3.51 21H20.49C20.85 21 21.21 20.91 21.53 20.73C22.47 20.19 22.79 18.99 22.25 18.05L13.78 3.86C13.6 3.53 13.34 3.27 13.01 3.09C12.07 2.56 10.87 2.88 10.29 3.86Z" stroke="#C0392B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Quantity is 0 &mdash; this product will automatically show as "Out of Stock" on the
              storefront.
            </div>
          </div>

          <div className="form-card">
            <h3>
              <span className="num">5</span> Merchandising Tags
            </h3>
            <p className="card-sub">
              Controls which homepage sections and nav links (New Arrivals / Specials / Best
              Sellers) this product appears under.
            </p>
            <div className="stock-toggle-group">
              <label className={`stock-option in${isNewArrival ? ' selected' : ''}`}>
                <input type="checkbox" checked={isNewArrival} onChange={(e) => setIsNewArrival(e.target.checked)} />
                <div className="dot"></div>
                <div className="lbl">NEW ARRIVAL</div>
              </label>
              <label className={`stock-option low${isSpecial ? ' selected' : ''}`}>
                <input type="checkbox" checked={isSpecial} onChange={(e) => setIsSpecial(e.target.checked)} />
                <div className="dot"></div>
                <div className="lbl">SPECIAL</div>
              </label>
              <label className={`stock-option in${isBestSeller ? ' selected' : ''}`}>
                <input type="checkbox" checked={isBestSeller} onChange={(e) => setIsBestSeller(e.target.checked)} />
                <div className="dot"></div>
                <div className="lbl">BEST SELLER</div>
              </label>
            </div>
          </div>

          <div className="form-footer">
            <span className="left">
              {saving ? '// Saving...' : '// Changes are not saved until you click "Save Product"'}
            </span>
            <div className="actions">
              {isEditMode && (
                <button type="button" className="btn-danger-outline" onClick={handleDelete} disabled={saving || uploadingImage}>
                  Delete Product
                </button>
              )}
              <button type="submit" className="apf-btn-primary" disabled={saving || uploadingImage}>
                {saving ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
