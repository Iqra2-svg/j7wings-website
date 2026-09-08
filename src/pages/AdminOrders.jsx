import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import '../styles/AdminDashboard.css';

const STATUS_OPTIONS = ['pending', 'processing', 'dispatched', 'delivered'];
const STATUS_LABEL = { pending: 'Pending', processing: 'Processing', dispatched: 'Dispatched', delivered: 'Delivered' };
const STATUS_CLASS = { pending: 'low', processing: 'dispatch', dispatched: 'dispatch', delivered: 'in' };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setOrders(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Failed to update status. Please try again.');
    }
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
          <Link to="/admin/orders" className="nav-item active">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M6 9H4L2 5H1M6 9L4.6 15.6C4.5 16.3 5.1 17 5.8 17H17.3C18 17 18.5 16.3 18.4 15.6L16 5H6M6 9H16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
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
            <div className="admin-avatar">A</div>
            <div>
              <div className="admin-name">Admin</div>
              <div className="admin-role">SUPER ADMIN</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div>
            <h1>Orders</h1>
            <div className="date">{orders.length} TOTAL ORDERS</div>
          </div>
        </div>

        <div className="table-card">
          <div className="table-head">
            <h3>All Orders</h3>
          </div>

          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Business</th>
                <th>Email</th>
                <th>Items</th>
                <th>Total</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#8A8577' }}>
                    Loading orders&hellip;
                  </td>
                </tr>
              )}
              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#8A8577' }}>
                    No orders yet.
                  </td>
                </tr>
              )}
              {!loading &&
                orders.map((o) => (
                  <tr key={o.id}>
                    <td className="item-code">#{o.id.slice(0, 8)}</td>
                    <td className="p-name">{o.businessName || '—'}</td>
                    <td style={{ fontSize: '12.5px', color: '#6E6A5F' }}>{o.email || '—'}</td>
                    <td className="mono">{(o.items || []).length} item{(o.items || []).length !== 1 ? 's' : ''}</td>
                    <td className="price-cell">${(o.total || 0).toFixed(2)}</td>
                    <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '11.5px', color: '#8A8577' }}>
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <select
                        value={o.status || 'pending'}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className={`stock-badge ${STATUS_CLASS[o.status] || 'low'}`}
                        style={{ border: 'none', cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABEL[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
