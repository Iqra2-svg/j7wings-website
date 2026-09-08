import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useCart } from '../context/CartContext';
import '../styles/Listing.css';

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

const CATEGORY_MENU = [
  {
    name: 'T-Shirts',
    subCategories: ["Men's T-Shirts", "Women's T-Shirts", 'Kids T-Shirts', 'Graphic Tees', 'Plain/Basic Tees'],
  },
  {
    name: 'Shoes',
    subCategories: ["Men's Shoes", "Women's Shoes", 'Kids Shoes', 'Sports/Sneakers', 'Sandals'],
  },
  {
    name: 'Crockery',
    subCategories: ['Plates', 'Bowls', 'Dinner Sets', 'Serving Platters', 'Drinking Glasses', 'Mugs', 'Tea Sets', 'Cups & Saucers'],
  },
];

export default function Listing() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart, totalItems } = useCart();

  const activeCategory = searchParams.get('category') || '';
  const activeSub = searchParams.get('sub') || '';
  const activeFilter = searchParams.get('filter') || ''; // 'new' | 'specials' | 'bestsellers'

  const FILTER_LABELS = { new: 'New Arrivals', specials: 'Specials', bestsellers: 'Best Sellers' };

  const [view, setView] = useState('grid');
  const [sort, setSort] = useState('Inventory');
  const [headerSearch, setHeaderSearch] = useState('');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sidebar filter state
  const [keyword, setKeyword] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedCPs, setSelectedCPs] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [lowInventoryOnly, setLowInventoryOnly] = useState(false);

  useEffect(() => {
    async function fetchAllProducts() {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, 'products'));
        const data = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: d.itemNo,
            name: d.name,
            category: d.category,
            subCategory: d.subCategory,
            cp: d.cp,
            price: d.price,
            stockStatus: d.stockStatus || 'in',
            isNewArrival: Boolean(d.isNewArrival),
            isSpecial: Boolean(d.isSpecial),
            isBestSeller: Boolean(d.isBestSeller),
            imageUrl: d.imageUrl || null,
            icon: iconForCategory(d.category),
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

  // Reset the sidebar's own filters whenever the category changes via the menu,
  // so switching categories doesn't carry over an irrelevant CP/price filter.
  useEffect(() => {
    setSelectedCPs([]);
    setPriceMin('');
    setPriceMax('');
    setKeyword('');
    setInStockOnly(false);
    setLowInventoryOnly(false);
  }, [activeCategory, activeSub]);

  const goToCategory = (category, sub) => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (sub) params.set('sub', sub);
    navigate(`/listing${params.toString() ? `?${params.toString()}` : ''}`);
    setShowCategoryMenu(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(headerSearch.trim())}`);
    }
  };

  const toggleCP = (cp) => {
    setSelectedCPs((prev) => (prev.includes(cp) ? prev.filter((c) => c !== cp) : [...prev, cp]));
  };

  // Products scoped to the selected category/sub-category (before the sidebar's own filters).
  const categoryScoped = allProducts.filter((p) => {
    if (activeCategory && p.category !== activeCategory) return false;
    if (activeSub && p.subCategory !== activeSub) return false;
    if (activeFilter === 'new' && !p.isNewArrival) return false;
    if (activeFilter === 'specials' && !p.isSpecial) return false;
    if (activeFilter === 'bestsellers' && !p.isBestSeller) return false;
    return true;
  });

  const availableCPs = [...new Set(categoryScoped.map((p) => p.cp))].sort((a, b) => a - b);

  const filteredProducts = categoryScoped.filter((p) => {
    if (keyword.trim() && !p.name.toLowerCase().includes(keyword.trim().toLowerCase())) return false;
    const min = parseFloat(priceMin);
    const max = parseFloat(priceMax);
    if (!isNaN(min) && p.price < min) return false;
    if (!isNaN(max) && p.price > max) return false;
    if (selectedCPs.length > 0 && !selectedCPs.includes(p.cp)) return false;
    if (inStockOnly && !lowInventoryOnly && p.stockStatus !== 'in') return false;
    if (lowInventoryOnly && !inStockOnly && p.stockStatus !== 'low') return false;
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === 'Price: Low to High') return a.price - b.price;
    if (sort === 'Price: High to Low') return b.price - a.price;
    return 0;
  });

  const pageTitle = activeFilter ? FILTER_LABELS[activeFilter] : activeSub || activeCategory || 'All Products';
  const pageDescription = activeFilter
    ? `Browse our current ${FILTER_LABELS[activeFilter].toLowerCase()} selection, sold in full case packs at reseller pricing.`
    : activeCategory
    ? `Browse our ${activeSub ? activeSub.toLowerCase() : activeCategory.toLowerCase()} lines, sold in full case packs at reseller pricing.`
    : 'Browse our full wholesale catalog across apparel, footwear, and crockery — sold in full case packs at reseller pricing.';

  return (
    <>
      <div className="topbar">
        <div className="wrap">
          <span>WHOLESALE ACCOUNTS &middot; MIN. ORDER $500</span>
          <span>
            <a href="#">Open a Wholesale Account</a> &nbsp;|&nbsp; <a href="#">Contact Us</a>
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
                <span>Wholesale Supply Co.</span>
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
            <div className="cat-dropdown-wrapper">
              <button type="button" className="cat-btn" onClick={() => setShowCategoryMenu((v) => !v)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M4 6H20M4 12H20M4 18H14" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
                ALL CATEGORIES
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ transform: showCategoryMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}
                >
                  <path d="M6 9L12 15L18 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {showCategoryMenu && (
                <div className="cat-mega-menu">
                  {CATEGORY_MENU.map((cat) => (
                    <div className="cat-mega-col" key={cat.name}>
                      <span className="cat-mega-heading" style={{ cursor: 'pointer' }} onClick={() => goToCategory(cat.name)}>
                        {cat.name}
                      </span>
                      {cat.subCategories.map((sub) => (
                        <span key={sub} className="cat-mega-link" style={{ cursor: 'pointer' }} onClick={() => goToCategory(cat.name, sub)}>
                          {sub}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
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
          {activeCategory ? (
            <>
              <span className="cat-mega-link" style={{ cursor: 'pointer', display: 'inline' }} onClick={() => goToCategory(activeCategory)}>
                {activeCategory}
              </span>
              {activeSub && (
                <>
                  <span className="sep">/</span>
                  <span className="current">{activeSub}</span>
                </>
              )}
            </>
          ) : (
            <span className="current">All Products</span>
          )}
        </div>
      </div>

      <div className="wrap">
        <div className="page-head">
          <div className="tag">// {activeFilter ? FILTER_LABELS[activeFilter].toUpperCase() : activeCategory ? `CATEGORY: ${activeCategory.toUpperCase()}` : 'FULL CATALOG'}</div>
          <h1>Wholesale {pageTitle}</h1>
          <p>{pageDescription}</p>
        </div>

        <div className="listing-layout">
          <aside className="sidebar">
            <div className="filter-block">
              <h4>Keywords</h4>
              <input
                type="text"
                placeholder="Search this category&hellip;"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <div className="filter-block">
              <h4>Category</h4>
              <div className="check-row" onClick={() => goToCategory('')} style={{ cursor: 'pointer' }}>
                <span className={`left${!activeCategory ? ' active-cat' : ''}`}>
                  {!activeCategory ? '\u00BB ' : ''}All Categories
                </span>
                <span className="count">{allProducts.length}</span>
              </div>
              {CATEGORY_MENU.map((cat) => {
                const count = allProducts.filter((p) => p.category === cat.name).length;
                const isActive = activeCategory === cat.name && !activeSub;
                return (
                  <div className="check-row" key={cat.name} onClick={() => goToCategory(cat.name)} style={{ cursor: 'pointer' }}>
                    <span className={`left${isActive ? ' active-cat' : ''}`}>
                      {isActive ? '\u00BB ' : ''}
                      {cat.name}
                    </span>
                    <span className="count">{count}</span>
                  </div>
                );
              })}
              {activeCategory &&
                CATEGORY_MENU.find((c) => c.name === activeCategory)?.subCategories.map((sub) => {
                  const count = allProducts.filter((p) => p.category === activeCategory && p.subCategory === sub).length;
                  const isActive = activeSub === sub;
                  return (
                    <div
                      className="check-row"
                      key={sub}
                      onClick={() => goToCategory(activeCategory, sub)}
                      style={{ cursor: 'pointer', paddingLeft: '14px' }}
                    >
                      <span className={`left${isActive ? ' active-cat' : ''}`}>
                        {isActive ? '\u00BB ' : ''}
                        {sub}
                      </span>
                      <span className="count">{count}</span>
                    </div>
                  );
                })}
            </div>
            <div className="filter-block">
              <h4>Price</h4>
              <div className="price-inputs">
                <input type="text" placeholder="Min" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />
                <span>&ndash;</span>
                <input type="text" placeholder="Max" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
              </div>
            </div>
            {availableCPs.length > 0 && (
              <div className="filter-block">
                <h4>Case Pack</h4>
                {availableCPs.map((cp) => {
                  const count = categoryScoped.filter((p) => p.cp === cp).length;
                  return (
                    <div className="check-row" key={cp} onClick={() => toggleCP(cp)} style={{ cursor: 'pointer' }}>
                      <span className="left">
                        <input type="checkbox" checked={selectedCPs.includes(cp)} onChange={() => {}} /> CP {cp}
                      </span>
                      <span className="count">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="filter-block">
              <h4>Status</h4>
              <div className="check-row" onClick={() => setInStockOnly((v) => !v)} style={{ cursor: 'pointer' }}>
                <span className="left">
                  <input type="checkbox" checked={inStockOnly} onChange={() => {}} /> In Stock
                </span>
                <span className="count">{categoryScoped.filter((p) => p.stockStatus === 'in').length}</span>
              </div>
              <div className="check-row" onClick={() => setLowInventoryOnly((v) => !v)} style={{ cursor: 'pointer' }}>
                <span className="left">
                  <input type="checkbox" checked={lowInventoryOnly} onChange={() => {}} /> Low Inventory
                </span>
                <span className="count">{categoryScoped.filter((p) => p.stockStatus === 'low').length}</span>
              </div>
            </div>
          </aside>

          <div className="results">
            <div className="toolbar">
              <div className="showing">
                SHOWING {sortedProducts.length ? 1 : 0}&ndash;{sortedProducts.length} OF {sortedProducts.length}
              </div>
              <div className="right">
                <div className="view-toggle">
                  <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M4 4H10V10H4V4ZM14 4H20V10H14V4ZM4 14H10V20H4V14ZM14 14H20V20H14V14Z" stroke={view === 'grid' ? '#fff' : '#16233F'} strokeWidth="2" />
                    </svg>
                  </button>
                  <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M4 6H20M4 12H20M4 18H20" stroke={view === 'list' ? '#fff' : '#16233F'} strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <div>
                  <label>Sort</label>
                  <select value={sort} onChange={(e) => setSort(e.target.value)}>
                    <option>Inventory</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {loading && (
              <div style={{ padding: '50px 20px', textAlign: 'center', color: '#8A8577', background: '#fff', border: '1px solid var(--line)' }}>
                Loading products&hellip;
              </div>
            )}

            {!loading && sortedProducts.length === 0 && (
              <div style={{ padding: '50px 20px', textAlign: 'center', color: '#8A8577', background: '#fff', border: '1px solid var(--line)' }}>
                No products match your filters. Try clearing some filters.
              </div>
            )}

            {!loading && sortedProducts.length > 0 && (
              <div className={`prod-grid${view === 'list' ? ' list-view' : ''}`}>
                {sortedProducts.map((p) => {
                  const Icon = p.icon;
                  return (
                    <div className="prod-card" key={p.id}>
                      <div className="stamp">
                        {p.stockStatus === 'low' ? 'LOW STOCK' : p.stockStatus === 'out' ? 'OUT OF STOCK' : 'IN STOCK'}
                      </div>
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
                          {p.name}
                        </Link>
                        <button
                          className="add"
                          onClick={() =>
                            addToCart({ id: p.id, name: p.name, cp: p.cp, itemNo: `#${p.id}`, price: p.price, icon: Icon })
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
          </div>
        </div>
      </div>

      <footer>
        <div className="wrap">
          <span>&copy; 2026 J7 Wings Wholesale Supply Co. All rights reserved.</span>
          <span className="mono" style={{ fontSize: '11.5px', color: '#6E7688' }}>
            CATALOG SYNCED &middot; WEEKLY
          </span>
        </div>
      </footer>
    </>
  );
}
