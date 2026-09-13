import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useCart } from '../context/CartContext';
import '../styles/ProductDetail.css';

const IconTee = ({ stroke = '#16233F' }) => (
  <svg viewBox="0 0 64 64" fill="none">
    <path d="M20 8L14 16V56H50V16L44 8H36L32 14L28 8H20Z" stroke={stroke} strokeWidth="2" />
  </svg>
);
const IconShoe = ({ stroke = '#16233F' }) => (
  <svg viewBox="0 0 64 64" fill="none">
    <path d="M8 46C8 46 12 38 20 38C24 38 24 42 30 42C36 42 38 34 46 34C52 34 56 40 56 40V50H8V46Z" stroke={stroke} strokeWidth="2" />
  </svg>
);
const IconBowl = ({ stroke = '#16233F' }) => (
  <svg viewBox="0 0 64 64" fill="none">
    <ellipse cx="32" cy="44" rx="22" ry="6" stroke={stroke} strokeWidth="2" />
    <path d="M10 44V30C10 24 20 20 32 20C44 20 54 24 54 30V44" stroke={stroke} strokeWidth="2" />
  </svg>
);

function iconForCategory(category) {
  if (category === 'Shoes') return IconShoe;
  if (category === 'Crockery') return IconBowl;
  return IconTee;
}

const staticTabs = {
  Description: (cp) => (
    <>
      <p>
        A wardrobe staple built for retail turnover. This item ships in an assorted case pack
        &mdash; ideal for dollar stores, discount retailers, and general merchandise shops
        stocking everyday basics.
      </p>
      <ul>
        <li>Reinforced construction, quality checked</li>
        <li>Assorted colors/styles per case</li>
        <li>Mixed sizes per case pack where applicable</li>
      </ul>
    </>
  ),
  Shipping: () => (
    <p>
      Orders ship within 48 hours via Standard Freight (3&ndash;5 business days) or Express
      Freight (1&ndash;2 business days). Freight is free on orders over $500.
    </p>
  ),
  'Case Pack Info': (cp) => (
    <p>
      This item is sold by the case only &mdash; 1 case contains {cp} units in an assorted mix.
      Case contents cannot be split or customized.
    </p>
  ),
};

export default function ProductDetail() {
  const { id } = useParams();
  const [activeThumb, setActiveThumb] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('Description');
  const [headerSearch, setHeaderSearch] = useState('');
  const navigate = useNavigate();
  const { addToCart, totalItems } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      setQty(1);
      setActiveTab('Description');
      try {
        const snap = await getDoc(doc(db, 'products', id));
        if (snap.exists()) {
          const d = snap.data();
          const loaded = {
            itemNo: d.itemNo,
            name: d.name,
            category: d.category,
            subCategory: d.subCategory,
            cp: d.cp,
            price: d.price,
            stockStatus: d.stockStatus,
            qoh: d.qoh,
            imageUrl: d.imageUrl || null,
            Icon: iconForCategory(d.category),
          };
          setProduct(loaded);

          // Fetch up to 4 other products from the same category for "Related Items"
          const q = query(collection(db, 'products'), where('category', '==', d.category), limit(5));
          const relSnap = await getDocs(q);
          const related = relSnap.docs
            .map((docSnap) => {
              const rd = docSnap.data();
              return {
                id: rd.itemNo,
                name: rd.name,
                cp: rd.cp,
                price: rd.price,
                stamp: rd.stockStatus === 'low' ? 'LOW STOCK' : rd.stockStatus === 'out' ? 'OUT OF STOCK' : 'IN STOCK',
                imageUrl: rd.imageUrl || null,
                Icon: iconForCategory(rd.category),
              };
            })
            .filter((p) => p.id !== d.itemNo)
            .slice(0, 4);
          setRelatedProducts(related);
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setProduct(null);
      }
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(headerSearch.trim())}`);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 24px', textAlign: 'center', fontFamily: 'IBM Plex Mono, monospace', color: '#8A8577' }}>
        Loading product&hellip;
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '12px' }}>Product Not Found</h1>
        <p style={{ color: '#6E6A5F' }}>
          This item may have been removed. <Link to="/listing">Back to catalog</Link>.
        </p>
      </div>
    );
  }

  const lineTotal = (qty * product.price * product.cp).toFixed(2);
  const ProductIcon = product.Icon;

  return (
    <>
      <div className="topbar">
        <div className="wrap">
          <span>MIN. ORDER $500</span>
          <span>
            <a href="#">Contact Us</a>
          </span>
        </div>
      </div>

      <header className="main">
        <div className="wrap">
          <div className="header-row">
            <Link to="/" className="logo">
              <div className="logo-mark">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 12L11 9L12 2L13 9L22 12L13 15L12 22L11 15L2 12Z" fill="#D98E2B" />
                </svg>
              </div>
              <div className="logo-text">
                J7 WINGS
                              </div>
            </Link>
            <nav className="primary">
              <Link to="/listing?filter=new">New Arrivals</Link>
              <Link to="/listing?filter=specials">Specials</Link>
              <Link to="/listing?filter=bestsellers">Best Sellers</Link>
              <Link to="/about">About</Link>
            </nav>
            <div className="header-actions">
              <Link to="/login" className="icon-btn">
                Sign In
              </Link>
              <Link to="/cart" className="icon-btn">
                Cart <span className="cart-badge">{totalItems}</span>
              </Link>
            </div>
          </div>
          <div className="search-row">
            <Link to="/listing" className="cat-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M4 6H20M4 12H20M4 18H14" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
              ALL CATEGORIES
            </Link>
            <form className="search-input-wrap" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Search by item name, SKU, or category&hellip;"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
              />
              <button type="submit">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 21L15.5 15.5M17.5 10.5C17.5 14.09 14.59 17 11 17C7.41 17 4.5 14.09 4.5 10.5C4.5 6.91 7.41 4 11 4C14.59 4 17.5 6.91 17.5 10.5Z"
                    stroke="#16233F"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="breadcrumb">
        <div className="wrap">
          <Link to="/">Home</Link>
          <span className="sep">/</span>
          <Link to="/listing">{product.category}</Link>
          <span className="sep">/</span>
          <Link to="/listing">{product.subCategory}</Link>
          <span className="sep">/</span>
          <span className="current">Item #{product.itemNo}</span>
        </div>
      </div>

      <div className="wrap">
        <div className="product-layout">
          <div>
            <div className="gallery-main">
              <div className="stamp">
                {product.stockStatus === 'low' ? 'LOW STOCK' : product.stockStatus === 'out' ? 'OUT OF STOCK' : 'IN STOCK'}
              </div>
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <ProductIcon />
              )}
            </div>
            <div className="thumb-row">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`thumb${activeThumb === i ? ' active' : ''}`}
                  onClick={() => setActiveThumb(i)}
                >
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <ProductIcon stroke={activeThumb === i ? '#16233F' : '#8A8577'} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="info-panel">
            <div className="p-eyebrow">// CAT &middot; {product.category?.toUpperCase()}</div>
            <h1>{product.name}</h1>
            <div className="in-stock-badge">
              {product.stockStatus === 'out' ? 'Out of Stock' : `In Stock \u00B7 ${product.qoh ?? 0} Units Available`}
            </div>

            <div className="price-block">
              <span className="price">${product.price.toFixed(2)}</span>
              <span className="unit">/ each &middot; sold per case</span>
            </div>

            <div className="spec-grid">
              <div className="cell">
                <div className="k">Item #</div>
                <div className="v">{product.itemNo}</div>
              </div>
              <div className="cell">
                <div className="k">Case Pack (CP)</div>
                <div className="v">{product.cp} units</div>
              </div>
              <div className="cell">
                <div className="k">Category</div>
                <div className="v">{product.category}</div>
              </div>
              <div className="cell">
                <div className="k">Sub-Category</div>
                <div className="v">{product.subCategory}</div>
              </div>
            </div>

            <div className="qty-row">
              <span className="qty-label">Quantity (cases)</span>
              <div className="qty-stepper">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}>&minus;</button>
                <input type="text" readOnly value={qty} />
                <button onClick={() => setQty((q) => q + 1)}>+</button>
              </div>
              <span className="qty-note">= {qty * product.cp} units</span>
            </div>

            <div className="cta-row">
              <button
                className="pd-btn-primary"
                onClick={() =>
                  addToCart(
                    { id: product.itemNo, name: product.name, cp: product.cp, itemNo: `#${product.itemNo}`, price: product.price, icon: ProductIcon },
                    qty
                  )
                }
              >
                Add to Cart &middot; ${lineTotal}
              </button>
              <button className="btn-icon">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20.8 4.6C19.6 3.4 17.7 3.4 16.5 4.6L12 9.1L7.5 4.6C6.3 3.4 4.4 3.4 3.2 4.6C2 5.8 2 7.7 3.2 8.9L12 17.7L20.8 8.9C22 7.7 22 5.8 20.8 4.6Z"
                    stroke="#16233F"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="manifest">
              <div className="row">
                <span className="k">SOLD BY</span>
                <span className="v">CASE ({product.cp} UNITS)</span>
              </div>
              <div className="row">
                <span className="k">FREIGHT</span>
                <span className="v">FREE OVER $500</span>
              </div>
              <div className="row">
                <span className="k">DISPATCH</span>
                <span className="v">WITHIN 48HRS</span>
              </div>
              <div className="row">
                <span className="k">RETURNS</span>
                <span className="v">14-DAY DEFECT POLICY</span>
              </div>
            </div>
          </div>
        </div>

        <div className="desc-section">
          <div className="desc-tabs">
            {Object.keys(staticTabs).map((tabName) => (
              <button
                key={tabName}
                className={activeTab === tabName ? 'active' : ''}
                onClick={() => setActiveTab(tabName)}
              >
                {tabName}
              </button>
            ))}
          </div>
          <div className="desc-body">{staticTabs[activeTab](product.cp)}</div>
        </div>
      </div>

      <div className="wrap related">
        <div className="section-head">
          <div>
            <div className="tag">// YOU MAY ALSO STOCK</div>
            <h2>Related Items</h2>
          </div>
        </div>
        <div className="prod-grid">
          {relatedProducts.map((p) => (
            <div className="prod-card" key={p.id}>
              <div className={`stamp${p.stamp === 'SALE' ? ' sale' : ''}`}>{p.stamp}</div>
              <Link to={`/product/${p.id}`} className="thumb">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <p.Icon />
                )}
              </Link>
              <div className="info">
                <div className="price">${p.price.toFixed(2)}</div>
                <div className="meta">
                  <span>CP: {p.cp}</span>
                  <span>#{p.id}</span>
                </div>
                <Link to={`/product/${p.id}`} className="name">
                  {p.name}
                </Link>
                <button
                  className="add"
                  onClick={() =>
                    addToCart({ id: p.id, name: p.name, cp: p.cp, itemNo: `#${p.id}`, price: p.price, icon: p.Icon })
                  }
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer>
        <div className="wrap">
          <span>&copy; 2026 J7 Wings. All rights reserved.</span>
          <span className="mono" style={{ fontSize: '11.5px', color: '#6E7688' }}>
            CATALOG SYNCED &middot; WEEKLY
          </span>
        </div>
      </footer>
    </>
  );
}
