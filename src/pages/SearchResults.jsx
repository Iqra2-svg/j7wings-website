import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useCart } from '../context/CartContext';
import '../styles/SearchResults.css';

const IconTee = () => (
  <svg viewBox="0 0 64 64" fill="none"><path d="M20 8L14 16V56H50V16L44 8H36L32 14L28 8H20Z" stroke="#16233F" strokeWidth="2.2" /></svg>
);
const IconShoe = () => (
  <svg viewBox="0 0 64 64" fill="none"><path d="M8 46C8 46 12 38 20 38C24 38 24 42 30 42C36 42 38 34 46 34C52 34 56 40 56 40V50H8V46Z" stroke="#16233F" strokeWidth="2.2" /></svg>
);
const IconBowl = () => (
  <svg viewBox="0 0 64 64" fill="none">
    <ellipse cx="32" cy="44" rx="22" ry="6" stroke="#16233F" strokeWidth="2.2" />
    <path d="M10 44V30C10 24 20 20 32 20C44 20 54 24 54 30V44" stroke="#16233F" strokeWidth="2.2" />
  </svg>
);

function iconForCategory(category) {
  if (category === 'Shoes') return IconShoe;
  if (category === 'Crockery') return IconBowl;
  return IconTee;
}

// Wraps any word from the search query that appears in the product name with <mark>.
function highlightMatches(text, query) {
  const words = query.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return text;
  const pattern = new RegExp(`(${words.join('|')})`, 'gi');
  const parts = text.split(pattern);
  return parts.map((part, i) =>
    words.some((w) => w.toLowerCase() === part.toLowerCase()) ? <mark key={i}>{part}</mark> : part
  );
}

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [activePill, setActivePill] = useState('All Results');
  const { addToCart, totalItems } = useCart();

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Keep the search box in sync if the user arrives via a new ?q= link (e.g. from the header search).
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  // Fetch the full catalog once — filtering below happens client-side.
  useEffect(() => {
    async function fetchAllProducts() {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, 'products'));
        const data = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: d.itemNo,
            icon: iconForCategory(d.category),
            category: d.category,
            price: d.price,
            cp: d.cp,
            name: d.name,
            stamp: d.stockStatus === 'low' ? 'LOW STOCK' : d.stockStatus === 'out' ? 'OUT OF STOCK' : 'IN STOCK',
            imageUrl: d.imageUrl || null,
          };
        });
        setAllProducts(data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      }
      setLoading(false);
    }
    fetchAllProducts();
  }, []);

  const categoryCounts = useMemo(() => {
    const counts = { 'T-Shirts': 0, Crockery: 0, Shoes: 0 };
    allProducts.forEach((p) => (counts[p.category] = (counts[p.category] || 0) + 1));
    return counts;
  }, [allProducts]);

  const searchMatched = searchQuery.trim()
    ? allProducts.filter((p) => p.name.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : allProducts;

  const filteredProducts =
    activePill === 'All Results' ? searchMatched : searchMatched.filter((p) => p.category === activePill);

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
              <Link to="/login">Sign In</Link>
              <Link to="/cart">
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
            <form className="search-input-wrap" onSubmit={(e) => e.preventDefault()}>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
          <span className="current">Search Results</span>
        </div>
      </div>

      <div className="wrap">
        <div className="page-head">
          <div className="tag">// SEARCH RESULTS</div>
          <h1>
            Results for &ldquo;<em>{searchQuery}</em>&rdquo;
          </h1>
          <div className="count">
            {filteredProducts.length} items found across {Object.values(categoryCounts).filter((c) => c > 0).length} categories
          </div>
        </div>

        <div className="pill-row">
          <div className={`pill${activePill === 'All Results' ? ' active' : ''}`} onClick={() => setActivePill('All Results')}>
            All Results <span className="n">({allProducts.length})</span>
          </div>
          <div className={`pill${activePill === 'T-Shirts' ? ' active' : ''}`} onClick={() => setActivePill('T-Shirts')}>
            T-Shirts <span className="n">({categoryCounts['T-Shirts']})</span>
          </div>
          <div className={`pill${activePill === 'Crockery' ? ' active' : ''}`} onClick={() => setActivePill('Crockery')}>
            Crockery <span className="n">({categoryCounts.Crockery})</span>
          </div>
        </div>

        <div className="listing-layout">
          <aside className="sidebar">
            <div className="filter-block">
              <h4>Refine Results</h4>
              <div className="check-row">
                <span className="left">
                  <input type="checkbox" /> In Stock Only
                </span>
                <span className="count">6</span>
              </div>
              <div className="check-row">
                <span className="left">
                  <input type="checkbox" /> On Sale
                </span>
                <span className="count">2</span>
              </div>
            </div>
            <div className="filter-block">
              <h4>Category</h4>
              <div className="check-row">
                <span className="left">
                  <input type="checkbox" checked readOnly /> T-Shirts
                </span>
                <span className="count">{categoryCounts['T-Shirts']}</span>
              </div>
              <div className="check-row">
                <span className="left">
                  <input type="checkbox" checked readOnly /> Crockery
                </span>
                <span className="count">{categoryCounts.Crockery}</span>
              </div>
              <div className="check-row">
                <span className="left">
                  <input type="checkbox" /> Shoes
                </span>
                <span className="count">0</span>
              </div>
            </div>
            <div className="filter-block">
              <h4>Price</h4>
              <div className="price-inputs">
                <input type="text" placeholder="Min" />
                <span>&ndash;</span>
                <input type="text" placeholder="Max" />
              </div>
              <button className="btn-go">Go</button>
            </div>
          </aside>

          <div>
            <div className="toolbar">
              <div className="showing">
                SHOWING 1&ndash;{filteredProducts.length} OF {filteredProducts.length}
              </div>
              <div>
                <label>Sort</label>
                <select>
                  <option>Relevance</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>
            </div>

            {loading && (
              <div style={{ padding: '50px 20px', textAlign: 'center', color: '#8A8577', background: '#fff', border: '1px solid var(--line)' }}>
                Loading products&hellip;
              </div>
            )}

            {!loading && filteredProducts.length > 0 && (
              <div className="prod-grid">
                {filteredProducts.map((p) => {
                  const Icon = p.icon;
                  return (
                    <div className="prod-card" key={p.id}>
                      <div className={`stamp${p.stamp === 'SALE' ? ' sale' : ''}`}>{p.stamp}</div>
                      <div className="cat-chip">{p.category}</div>
                      <Link to={`/product/${p.id}`} className="thumb">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Icon />
                        )}
                      </Link>
                      <div className="info">
                        <div className="price-row">
                          <span className="price">${p.price.toFixed(2)}</span>
                        </div>
                        <div className="meta">
                          <span>CP: {p.cp}</span>
                          <span>#{p.id}</span>
                        </div>
                        <Link to={`/product/${p.id}`} className="name">
                          {highlightMatches(p.name, searchQuery)}
                        </Link>
                        <button
                          className="add"
                          onClick={() =>
                            addToCart({ id: p.id, name: p.name, cp: p.cp, itemNo: `#${p.id}`, price: p.price, icon: p.icon })
                          }
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {!loading && filteredProducts.length === 0 && (
              <div className="no-results">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 21L15.5 15.5M17.5 10.5C17.5 14.09 14.59 17 11 17C7.41 17 4.5 14.09 4.5 10.5C4.5 6.91 7.41 4 11 4C14.59 4 17.5 6.91 17.5 10.5Z"
                    stroke="#16233F"
                    strokeWidth="1.6"
                  />
                </svg>
                <h3>No results found</h3>
                <p>We couldn't find any products matching your search. Try a different keyword or browse by category.</p>
                <div className="sugg">
                  Try: <Link to="/listing">T-Shirts</Link> &middot; <Link to="/listing">Shoes</Link> &middot;{' '}
                  <Link to="/listing">Crockery</Link>
                </div>
              </div>
            )}
          </div>
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
