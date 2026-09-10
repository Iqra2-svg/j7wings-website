import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, deleteDoc, query, orderBy, limit } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase';
import '../styles/AdminDashboard.css';

// Icons used across the dashboard (kept as small components so JSX below stays readable)
const IconDashboard = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M3 13H10V3H3V13ZM3 21H10V15H3V21ZM12 21H21V11H12V21ZM12 3V9H21V3H12Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
  </svg>
);
const IconProducts = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M3 7L12 3L21 7M3 7L12 11M3 7V17L12 21M21 7L12 11M21 7V17L12 21M12 11V21" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
  </svg>
);
const IconOrders = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M6 9H4L2 5H1M6 9L4.6 15.6C4.5 16.3 5.1 17 5.8 17H17.3C18 17 18.5 16.3 18.4 15.6L16 5H6M6 9H16M9 21C9.6 21 10 20.6 10 20C10 19.4 9.6 19 9 19C8.4 19 8 19.4 8 20C8 20.6 8.4 21 9 21ZM17 21C17.6 21 18 20.6 18 20C18 19.4 17.6 19 17 19C16.4 19 16 19.4 16 20C16 20.6 16.4 21 17 21Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconCustomers = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M17 21V19C17 16.79 15.21 15 13 15H5C2.79 15 1 16.79 1 19V21M23 21V19C23 17.13 21.73 15.56 20 15.11M16 3.11C17.73 3.56 19 5.13 19 7C19 8.87 17.73 10.44 16 10.89M13 7C13 9.21 11.21 11 9 11C6.79 11 5 9.21 5 7C5 4.79 6.79 3 9 3C11.21 3 13 4.79 13 7Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconSettings = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2.06 2.06 0 1 1-2.92 2.92l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2.06 2.06 0 1 1-4.12 0v-.09A1.7 1.7 0 0 0 9 19.36a1.7 1.7 0 0 0-1.87.34l-.06.06a2.06 2.06 0 1 1-2.92-2.92l.06-.06A1.7 1.7 0 0 0 4.55 15a1.7 1.7 0 0 0-1.55-1H3a2.06 2.06 0 1 1 0-4.12h.09A1.7 1.7 0 0 0 4.64 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2.06 2.06 0 1 1 2.92-2.92l.06.06A1.7 1.7 0 0 0 9 4.55a1.7 1.7 0 0 0 1-1.55V3a2.06 2.06 0 1 1 4.12 0v.09A1.7 1.7 0 0 0 15 4.64a1.7 1.7 0 0 0 1.87-.34l.06-.06a2.06 2.06 0 1 1 2.92 2.92l-.06.06A1.7 1.7 0 0 0 19.45 9a1.7 1.7 0 0 0 1.55 1H21a2.06 2.06 0 1 1 0 4.12h-.09a1.7 1.7 0 0 0-1.51.88Z" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);
const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2.3" strokeLinecap="round" />
  </svg>
);
const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M21 21L15.5 15.5M17.5 10.5C17.5 14.09 14.59 17 11 17C7.41 17 4.5 14.09 4.5 10.5C4.5 6.91 7.41 4 11 4C14.59 4 17.5 6.91 17.5 10.5Z" stroke="#8A8577" strokeWidth="1.8" />
  </svg>
);
const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M17 3C17.53 2.47 18.24 2.17 19 2.17C19.76 2.17 20.47 2.47 21 3C21.53 3.53 21.83 4.24 21.83 5C21.83 5.76 21.53 6.47 21 7L7.5 20.5L2 22L3.5 16.5L17 3Z" stroke="#16233F" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);
const IconDelete = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M3 6H21M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6H19Z" stroke="#8A8577" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconTee = () => (
  <svg viewBox="0 0 64 64" fill="none"><path d="M20 8L14 16V56H50V16L44 8H36L32 14L28 8H20Z" stroke="#16233F" strokeWidth="2.4" /></svg>
);
const IconShoe = () => (
  <svg viewBox="0 0 64 64" fill="none"><path d="M8 46C8 46 12 38 20 38C24 38 24 42 30 42C36 42 38 34 46 34C52 34 56 40 56 40V50H8V46Z" stroke="#16233F" strokeWidth="2.4" /></svg>
);
const IconBowl = () => (
  <svg viewBox="0 0 64 64" fill="none">
    <ellipse cx="32" cy="44" rx="22" ry="6" stroke="#16233F" strokeWidth="2.4" />
    <path d="M10 44V30C10 24 20 20 32 20C44 20 54 24 54 30V44" stroke="#16233F" strokeWidth="2.4" />
  </svg>
);

function iconForCategory(category) {
  if (category === 'Shoes') return IconShoe;
  if (category === 'Crockery') return IconBowl;
  return IconTee;
}

const stockBadgeLabel = { in: 'In Stock', low: 'Low Stock', out: 'Out of Stock' };
const statusChipLabel = { pending: 'Pending', processing: 'Processing', dispatch: 'Preparing', dispatched: 'Dispatched', delivered: 'Delivered' };
const statusChipClass = { pending: 'dispatch', processing: 'dispatch', dispatch: 'dispatch', dispatched: 'dispatch', delivered: 'delivered' };

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/admin/login');
  };

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [recentOrders, setRecentOrders] = useState([]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      const data = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: d.itemNo,
          name: d.name,
          cat: d.subCategory,
          category: d.category,
          price: d.price,
          cp: d.cp,
          qoh: d.qoh ?? 0,
          status: d.stockStatus || 'in',
          icon: iconForCategory(d.category),
        };
      });
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
    setLoading(false);
  };

  const fetchRecentOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(4));
      const snapshot = await getDocs(q);
      setRecentOrders(
        snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: `#${docSnap.id.slice(0, 8)}`,
            customer: d.businessName || d.email || '—',
            status: d.status || 'pending',
            amount: `$${(d.total || 0).toFixed(2)}`,
          };
        })
      );
    } catch (err) {
      console.error('Failed to fetch recent orders:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchRecentOrders();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete product #${id}? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Failed to delete product. Please try again.');
    }
  };

  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== 'All Categories' && p.category !== categoryFilter) return false;
    if (searchTerm.trim() && !p.name.toLowerCase().includes(searchTerm.trim().toLowerCase())) return false;
    return true;
  });

  const totalProducts = products.length;
  const lowStockProducts = products.filter((p) => p.status === 'low' || p.status === 'out');
  const pendingOrders = recentOrders.filter((o) => o.status !== 'delivered').length;
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
          <Link to="/admin/dashboard" className="nav-item active">
            <IconDashboard />
            Dashboard
          </Link>
        </div>

        <div className="nav-group">
          <div className="nav-label">Catalog</div>
          <Link to="/admin/dashboard" className="nav-item">
            <IconProducts />
            Products
          </Link>
          <Link to="/admin/orders" className="nav-item">
            <IconOrders />
            Orders
          </Link>
          <Link to="/admin/customers" className="nav-item">
            <IconCustomers />
            Customers
          </Link>
        </div>

        <div className="nav-group">
          <div className="nav-label">Account</div>
          <div className="nav-item">
            <IconSettings />
            Settings
          </div>
        </div>

        <div className="sidebar-foot">
          <div className="admin-chip">
            <div className="admin-avatar">{(auth.currentUser?.email || 'A')[0].toUpperCase()}</div>
            <div>
              <div className="admin-name">{auth.currentUser?.email || 'Admin'}</div>
              <div className="admin-role">SUPER ADMIN</div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            style={{
              marginTop: '12px',
              width: '100%',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#B7BDCB',
              padding: '9px',
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '11px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      <main className="adm-main">
        <div className="topbar">
          <div>
            <h1>Dashboard</h1>
            <div className="date">THURSDAY, AUGUST 06, 2026</div>
          </div>
          <Link to="/admin/products/new" className="adb-btn-primary">
            <IconPlus />
            Add Product
          </Link>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <div className="top">
              <div className="stat-icon">
                <IconProducts />
              </div>
              <span className="stat-trend">LIVE</span>
            </div>
            <div className="n">{totalProducts}</div>
            <div className="l">Total Products</div>
          </div>
          <div className="stat-card">
            <div className="top">
              <div className="stat-icon">
                <IconOrders />
              </div>
              <span className="stat-trend">&mdash;</span>
            </div>
            <div className="n">{pendingOrders}</div>
            <div className="l">Pending Orders</div>
          </div>
          <div className="stat-card">
            <div className="top">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18C1.64 18.32 1.55 18.68 1.55 19.04C1.55 20.13 2.43 21 3.51 21H20.49C20.85 21 21.21 20.91 21.53 20.73C22.47 20.19 22.79 18.99 22.25 18.05L13.78 3.86C13.6 3.53 13.34 3.27 13.01 3.09C12.07 2.56 10.87 2.88 10.29 3.86Z" stroke="#B5721A" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="stat-trend down">{lowStockProducts.length > 0 ? 'ACTION NEEDED' : 'ALL GOOD'}</span>
            </div>
            <div className="n">{lowStockProducts.length}</div>
            <div className="l">Low Stock Items</div>
          </div>
          <div className="stat-card">
            <div className="top">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 1V23M17 5H9.5C8.57 5 7.69 5.37 7.03 6.03C6.37 6.69 6 7.57 6 8.5C6 9.43 6.37 10.31 7.03 10.97C7.69 11.63 8.57 12 9.5 12H14.5C15.43 12 16.31 12.37 16.97 13.03C17.63 13.69 18 14.57 18 15.5C18 16.43 17.63 17.31 16.97 17.97C16.31 18.63 15.43 19 14.5 19H6" stroke="#16233F" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </div>
              <span className="stat-trend">&mdash;</span>
            </div>
            <div className="n">&mdash;</div>
            <div className="l">Revenue (Awaiting Orders)</div>
          </div>
        </div>

        <div className="table-card">
          <div className="table-head">
            <h3>Product Catalog</h3>
            <div className="table-tools">
              <div className="search-box">
                <IconSearch />
                <input
                  type="text"
                  placeholder="Search products&hellip;"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select className="cat-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option>All Categories</option>
                <option>T-Shirts</option>
                <option>Shoes</option>
                <option>Crockery</option>
              </select>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Item#</th>
                <th>Category</th>
                <th>Price</th>
                <th>CP</th>
                <th>Stock</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#8A8577' }}>
                    Loading products&hellip;
                  </td>
                </tr>
              )}
              {!loading && filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#8A8577' }}>
                    No products found.
                  </td>
                </tr>
              )}
              {!loading &&
                filteredProducts.map((p) => {
                  const Icon = p.icon;
                  return (
                    <tr key={p.id}>
                      <td>
                        <Link to={`/admin/products/${p.id}/edit`} className="p-cell">
                          <div className="p-thumb">
                            <Icon />
                          </div>
                          <div>
                            <div className="p-name">{p.name}</div>
                            <div className="p-cat">{p.cat}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="item-code">#{p.id}</td>
                      <td>{p.category}</td>
                      <td className="price-cell">${p.price.toFixed(2)}</td>
                      <td className="mono">{p.cp}</td>
                      <td className="mono">{p.qoh}</td>
                      <td>
                        <span className={`stock-badge ${p.status}`}>{stockBadgeLabel[p.status]}</span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <Link to={`/admin/products/${p.id}/edit`} className="adm-icon-btn">
                            <IconEdit />
                          </Link>
                          <button className="adm-icon-btn del" onClick={() => handleDelete(p.id)}>
                            <IconDelete />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>

          <div className="table-foot">
            <span>SHOWING {filteredProducts.length} OF {totalProducts} PRODUCTS</span>
          </div>
        </div>

        <div className="bottom-grid">
          <div className="panel">
            <h3>Recent Orders</h3>
            {recentOrders.map((o) => (
              <div className="order-row" key={o.id}>
                <div>
                  <div className="order-id">{o.id}</div>
                  <div className="order-cust">{o.customer}</div>
                </div>
                <span className={`status-chip ${statusChipClass[o.status] || 'dispatch'}`}>{statusChipLabel[o.status] || o.status}</span>
                <div className="order-amt">{o.amount}</div>
              </div>
            ))}
          </div>

          <div className="panel">
            <h3>Low Stock Alerts</h3>
            {lowStockProducts.length === 0 && (
              <p style={{ color: '#8A8577', fontSize: '13px' }}>No low-stock items right now.</p>
            )}
            {lowStockProducts.slice(0, 5).map((p) => {
              const Icon = p.icon;
              return (
                <div className="low-stock-row" key={p.id}>
                  <div className="p-thumb">
                    <Icon />
                  </div>
                  <div>
                    <div className="low-stock-name">{p.name}</div>
                    <div className="low-stock-qty">{p.qoh} units left</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
