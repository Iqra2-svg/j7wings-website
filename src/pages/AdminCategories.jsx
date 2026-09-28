import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import useCategories from '../hooks/useCategories';
import '../styles/AdminDashboard.css';
import '../styles/AdminCategories.css';

export default function AdminCategories() {
  const navigate = useNavigate();
  const {
    categories,
    loading,
    addMainCategory,
    addSubCategory,
    deleteMainCategory,
    deleteSubCategory,
  } = useCategories();

  const [productCounts, setProductCounts] = useState({});
  const [newMainCat, setNewMainCat] = useState('');
  const [subInputs, setSubInputs] = useState({}); // { [categoryName]: typedValue }
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function loadCounts() {
      try {
        const snapshot = await getDocs(collection(db, 'products'));
        const counts = {};
        snapshot.docs.forEach((d) => {
          const cat = d.data().category;
          if (cat) counts[cat] = (counts[cat] || 0) + 1;
        });
        setProductCounts(counts);
      } catch (err) {
        console.error('Failed to load product counts:', err);
      }
    }
    loadCounts();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/admin/login');
  };

  const handleAddMainCategory = async (e) => {
    e.preventDefault();
    if (!newMainCat.trim()) return;
    setBusy(true);
    try {
      await addMainCategory(newMainCat.trim());
      setNewMainCat('');
    } catch (err) {
      console.error('Failed to add category:', err);
      alert('Failed to add category. Please try again.');
    }
    setBusy(false);
  };

  const handleAddSubCategory = async (catName) => {
    const value = (subInputs[catName] || '').trim();
    if (!value) return;
    setBusy(true);
    try {
      await addSubCategory(catName, value);
      setSubInputs((prev) => ({ ...prev, [catName]: '' }));
    } catch (err) {
      console.error('Failed to add sub-category:', err);
      alert('Failed to add sub-category. Please try again.');
    }
    setBusy(false);
  };

  const handleDeleteSubCategory = async (catName, sub) => {
    if (!window.confirm(`Remove sub-category "${sub}" from ${catName}?`)) return;
    setBusy(true);
    try {
      await deleteSubCategory(catName, sub);
    } catch (err) {
      console.error('Failed to delete sub-category:', err);
      alert('Failed to delete sub-category. Please try again.');
    }
    setBusy(false);
  };

  const handleDeleteMainCategory = async (catName) => {
    const count = productCounts[catName] || 0;
    const warning =
      count > 0
        ? `"${catName}" is currently used by ${count} product${count === 1 ? '' : 's'}. Those products will keep showing this category, but it will no longer appear in the menu or dropdowns.\n\nDelete "${catName}" anyway?`
        : `Delete category "${catName}"? This cannot be undone.`;
    if (!window.confirm(warning)) return;
    setBusy(true);
    try {
      await deleteMainCategory(catName);
    } catch (err) {
      console.error('Failed to delete category:', err);
      alert('Failed to delete category. Please try again.');
    }
    setBusy(false);
  };

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
          <Link to="/admin/dashboard" className="nav-item">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M3 7L12 3L21 7M3 7L12 11M3 7V17L12 21M21 7L12 11M21 7V17L12 21M12 11V21" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            </svg>
            Products
          </Link>
          <Link to="/admin/categories" className="nav-item active">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 4H10L12 7H20V19H4V4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            </svg>
            Categories
          </Link>
          <Link to="/admin/orders" className="nav-item">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M6 9H4L2 5H1M6 9L4.6 15.6C4.5 16.3 5.1 17 5.8 17H17.3C18 17 18.5 16.3 18.4 15.6L16 5H6M6 9H16M9 21C9.6 21 10 20.6 10 20C10 19.4 9.6 19 9 19C8.4 19 8 19.4 8 20C8 20.6 8.4 21 9 21ZM17 21C17.6 21 18 20.6 18 20C18 19.4 17.6 19 17 19C16.4 19 16 19.4 16 20C16 20.6 16.4 21 17 21Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Orders
          </Link>
          <Link to="/admin/customers" className="nav-item">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M17 21V19C17 16.79 15.21 15 13 15H5C2.79 15 1 16.79 1 19V21M23 21V19C23 17.13 21.73 15.56 20 15.11M16 3.11C17.73 3.56 19 5.13 19 7C19 8.87 17.73 10.44 16 10.89M13 7C13 9.21 11.21 11 9 11C6.79 11 5 9.21 5 7C5 4.79 6.79 3 9 3C11.21 3 13 4.79 13 7Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Customers
          </Link>
        </div>

        <div className="sidebar-foot">
          <div className="admin-chip">
            <div className="admin-avatar">{(auth.currentUser?.email || 'A')[0].toUpperCase()}</div>
            <div>
              <div className="admin-name">{auth.currentUser?.email || 'Admin'}</div>
              <div className="admin-role">SUPER ADMIN</div>
            </div>
          </div>
          <button onClick={handleSignOut} className="catmgr-signout">
            Sign Out
          </button>
        </div>
      </aside>

      <main className="adm-main">
        <div className="topbar">
          <div>
            <h1>Categories</h1>
            <div className="date">{categories.length} MAIN CATEGORIES</div>
          </div>
        </div>

        <div className="table-card catmgr-add-card">
          <div className="table-head">
            <h3>Add a New Main Category</h3>
          </div>
          <form className="catmgr-add-form" onSubmit={handleAddMainCategory}>
            <input
              type="text"
              placeholder="e.g. Home Textiles"
              value={newMainCat}
              onChange={(e) => setNewMainCat(e.target.value)}
            />
            <button type="submit" className="adb-btn-primary" disabled={busy}>
              + Add Category
            </button>
          </form>
        </div>

        {loading && (
          <div className="table-card" style={{ padding: '30px', textAlign: 'center', color: '#8A8577' }}>
            Loading categories&hellip;
          </div>
        )}

        {!loading &&
          categories.map((cat) => (
            <div className="table-card catmgr-cat-card" key={cat.name}>
              <div className="table-head">
                <div>
                  <h3>{cat.name}</h3>
                  <div className="catmgr-count">
                    {productCounts[cat.name] || 0} product{(productCounts[cat.name] || 0) === 1 ? '' : 's'} in this category
                  </div>
                </div>
                <button
                  type="button"
                  className="catmgr-delete-main"
                  onClick={() => handleDeleteMainCategory(cat.name)}
                  disabled={busy}
                >
                  Delete Category
                </button>
              </div>

              <div className="catmgr-body">
                <div className="catmgr-chips">
                  {cat.subCategories.length === 0 && <span className="catmgr-empty">No sub-categories yet.</span>}
                  {cat.subCategories.map((sub) => (
                    <span className="catmgr-chip" key={sub}>
                      {sub}
                      <button type="button" onClick={() => handleDeleteSubCategory(cat.name, sub)} disabled={busy}>
                        &times;
                      </button>
                    </span>
                  ))}
                </div>

                <div className="catmgr-sub-add">
                  <input
                    type="text"
                    placeholder="New sub-category name&hellip;"
                    value={subInputs[cat.name] || ''}
                    onChange={(e) => setSubInputs((prev) => ({ ...prev, [cat.name]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubCategory(cat.name);
                      }
                    }}
                  />
                  <button type="button" onClick={() => handleAddSubCategory(cat.name)} disabled={busy}>
                    + Add
                  </button>
                </div>
              </div>
            </div>
          ))}
      </main>
    </div>
  );
}
