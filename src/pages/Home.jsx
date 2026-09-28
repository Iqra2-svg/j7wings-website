import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useCart } from '../context/CartContext';
import Footer from '../components/Footer';
import useCategories from '../hooks/useCategories';
import '../styles/Home.css';

const IconTee = () => (
  <svg viewBox="0 0 64 64" fill="none">
    <path d="M20 8L14 16V56H50V16L44 8H36L32 14L28 8H20Z" stroke="#16233F" strokeWidth="2.2" />
  </svg>
);
const IconShoe = () => (
  <svg viewBox="0 0 64 64" fill="none">
    <path d="M8 46C8 46 12 38 20 38C24 38 24 42 30 42C36 42 38 34 46 34C52 34 56 40 56 40V50H8V46Z" stroke="#16233F" strokeWidth="2.2" />
  </svg>
);
const IconBowl = () => (
  <svg viewBox="0 0 64 64" fill="none">
    <ellipse cx="32" cy="44" rx="22" ry="6" stroke="#16233F" strokeWidth="2.2" />
    <path d="M10 44V30C10 24 20 20 32 20C44 20 54 24 54 30V44" stroke="#16233F" strokeWidth="2.2" />
  </svg>
);

export default function Home() {
  const [headerSearch, setHeaderSearch] = useState('');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const navigate = useNavigate();
  const { addToCart, totalItems } = useCart();
  // Nav "Shop by Category" menu now reflects whatever categories the admin
  // has added/deleted from Admin > Categories, instead of a fixed list.
  const { categories: CATEGORY_MENU } = useCategories();

  const [newArrivals, setNewArrivals] = useState([]);
  const [specials, setSpecials] = useState([]);
  const [categoryImages, setCategoryImages] = useState({});
  const [loading, setLoading] = useState(true);

  const iconForCategory = (category) => {
    if (category === 'Shoes') return IconShoe;
    if (category === 'Crockery') return IconBowl;
    return IconTee;
  };

  const mapDoc = (docSnap) => {
    const d = docSnap.data();
    return {
      id: d.itemNo,
      name: d.name,
      cp: d.cp,
      price: d.price,
      category: d.category,
      stockStatus: d.stockStatus,
      imageUrl: d.imageUrl || null,
      icon: iconForCategory(d.category),
    };
  };

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const newQ = query(collection(db, 'products'), where('isNewArrival', '==', true), limit(4));
        const specialQ = query(collection(db, 'products'), where('isSpecial', '==', true), limit(4));
        const [newSnap, specialSnap] = await Promise.all([getDocs(newQ), getDocs(specialQ)]);
        setNewArrivals(newSnap.docs.map(mapDoc));
        setSpecials(specialSnap.docs.map(mapDoc));
      } catch (err) {
        console.error('Failed to fetch products:', err);
      }
      setLoading(false);
    }
    fetchProducts();

    // Pull one product photo per category (whichever has an image uploaded)
    // to use as the "Shop by Category" card background.
    async function fetchCategoryImages() {
      const categories = ['T-Shirts', 'Shoes', 'Crockery'];
      const images = {};
      try {
        await Promise.all(
          categories.map(async (cat) => {
            const q = query(collection(db, 'products'), where('category', '==', cat), limit(10));
            const snap = await getDocs(q);
            const withImage = snap.docs.find((d) => d.data().imageUrl);
            if (withImage) images[cat] = withImage.data().imageUrl;
          })
        );
        setCategoryImages(images);
      } catch (err) {
        console.error('Failed to fetch category images:', err);
      }
    }
    fetchCategoryImages();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(headerSearch.trim())}`);
    }
  };

  const goToCategory = (category, sub) => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (sub) params.set('sub', sub);
    navigate(`/listing${params.toString() ? `?${params.toString()}` : ''}`);
    setShowCategoryMenu(false);
  };

  return (
    <div className="page-home">
      <div className="topbar">
        <div className="wrap">
          <span>MIN. ORDER $500</span>
          <span>
            <a href="#">Contact Us</a> &nbsp;|&nbsp; +92 300 000 0000
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 21C20 17.13 16.42 14 12 14C7.58 14 4 17.13 4 21M12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Sign In
              </Link>
              <Link to="/cart" className="icon-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 3H5L5.4 5M5.4 5H21L18 13H7M5.4 5L7 13M7 13L4.5 16H19M9 20C9.55 20 10 19.55 10 19C10 18.45 9.55 18 9 18C8.45 18 8 18.45 8 19C8 19.55 8.45 20 9 20ZM18 20C18.55 20 19 19.55 19 19C19 18.45 18.55 18 18 18C17.45 18 17 18.45 17 19C17 19.55 17.45 20 18 20Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Cart <span className="cart-badge">{totalItems}</span>
              </Link>
            </div>
          </div>
          <div className="search-row">
            <div className="cat-dropdown-wrapper">
              <button
                type="button"
                className="cat-btn"
                onClick={() => setShowCategoryMenu((v) => !v)}
              >
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
                      <span
                        className="cat-mega-heading"
                        style={{ cursor: 'pointer' }}
                        onClick={() => goToCategory(cat.name)}
                      >
                        {cat.name}
                      </span>
                      {cat.subCategories.map((sub) => (
                        <span
                          key={sub}
                          className="cat-mega-link"
                          style={{ cursor: 'pointer' }}
                          onClick={() => goToCategory(cat.name, sub)}
                        >
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

      <div className="announce">
        FREE FREIGHT ON ORDERS OVER $500 &nbsp;&middot;&nbsp; NEW BUYERS GET 10% OFF FIRST INVOICE
      </div>

      <section className="hero">
        <div className="wrap">
          <div>
            <div className="eyebrow">Est. Import &amp; Distribution</div>
            <h1>
              Stock your shelves with <em>reliable</em> service.
            </h1>
            <p>
              J7 Wings supplies apparel, footwear, and crockery to dollar stores, discount
              retailers, and gift shops &mdash; at case-pack pricing built for resellers.
            </p>
            <div>
              <Link to="/listing" className="home-btn-primary">
                Shop the Catalog
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12H19M19 12L12 5M19 12L12 19"
                    stroke="#16233F"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <Link to="/login" className="home-btn-outline">
                Open an Account
              </Link>
            </div>
          </div>
          <div className="hero-crate">
            <div className="crate-tag" style={{ top: '10px', left: '20px' }}>
              <div className="k">Item #10007</div>
              <div className="v">Graphic Tee &middot; CP 12</div>
            </div>
            <div className="crate-tag" style={{ top: '130px', right: '10px' }}>
              <div className="k">Item #20003</div>
              <div className="v">Flat Shoes &middot; CP 6</div>
            </div>
            <div className="crate-tag" style={{ bottom: '20px', left: '60px' }}>
              <div className="k">Item #30003</div>
              <div className="v">Dinner Set 16pc</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="cat">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="tag">// SHOP BY CATEGORY</div>
              <h2>Three Lines, Full Case Packs</h2>
            </div>
            <Link to="/listing" className="view-all">
              View All Categories &rarr;
            </Link>
          </div>
          <div className="cat-grid">
            <Link to="/listing?category=T-Shirts" className="cat-card cc-1">
              <div className="img">
                {categoryImages['T-Shirts'] ? (
                  <img
                    src={categoryImages['T-Shirts']}
                    alt="T-Shirts"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <svg viewBox="0 0 64 64" fill="none">
                  <path
                    d="M20 8L14 16V56H50V16L44 8H36L32 14L28 8H20Z"
                    stroke="#16233F"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 16L8 20L14 26"
                    stroke="#16233F"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M50 16L56 20L50 26"
                    stroke="#16233F"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                )}
              </div>
              <div className="body">
                <div className="num">CAT-01</div>
                <h3>T-Shirts</h3>
                <span className="cta">Browse 8 lines &rarr;</span>
              </div>
            </Link>
            <Link to="/listing?category=Shoes" className="cat-card cc-2">
              <div className="img">
                {categoryImages['Shoes'] ? (
                  <img
                    src={categoryImages['Shoes']}
                    alt="Shoes"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <svg viewBox="0 0 64 64" fill="none">
                  <path
                    d="M8 46C8 46 12 38 20 38C24 38 24 42 30 42C36 42 38 34 46 34C52 34 56 40 56 40V50H8V46Z"
                    stroke="#16233F"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                  <path d="M14 38V24C14 24 20 20 26 24" stroke="#16233F" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                )}
              </div>
              <div className="body">
                <div className="num">CAT-02</div>
                <h3>Shoes</h3>
                <span className="cta">Browse 8 lines &rarr;</span>
              </div>
            </Link>
            <Link to="/listing?category=Crockery" className="cat-card cc-3">
              <div className="img">
                {categoryImages['Crockery'] ? (
                  <img
                    src={categoryImages['Crockery']}
                    alt="Crockery"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <svg viewBox="0 0 64 64" fill="none">
                  <ellipse cx="32" cy="44" rx="22" ry="6" stroke="#16233F" strokeWidth="2.5" />
                  <path d="M10 44V30C10 24 20 20 32 20C44 20 54 24 54 30V44" stroke="#16233F" strokeWidth="2.5" />
                  <path d="M46 26C50 24 54 26 54 30" stroke="#16233F" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                )}
              </div>
              <div className="body">
                <div className="num">CAT-03</div>
                <h3>Crockery</h3>
                <span className="cta">Browse 5 lines &rarr;</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="section" id="new" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="tag">// JUST LANDED</div>
              <h2>New Arrivals</h2>
            </div>
            <Link to="/listing?filter=new" className="view-all">
              View All &rarr;
            </Link>
          </div>
          {loading && <p style={{ color: '#C9CEDA', fontFamily: 'IBM Plex Mono, monospace', fontSize: '13px' }}>Loading products&hellip;</p>}
          {!loading && newArrivals.length === 0 && (
            <p style={{ color: '#C9CEDA', fontFamily: 'IBM Plex Mono, monospace', fontSize: '13px' }}>
              No products marked as New Arrival yet — mark some from the Admin Panel.
            </p>
          )}
          <div className="prod-grid">
            {newArrivals.map((p) => {
              const Icon = p.icon;
              return (
                <div className="prod-card" key={p.id}>
                  <div className={`stamp${p.stockStatus === 'low' ? '' : ''}`}>
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
        </div>
      </section>

      <section className="section" id="specials" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="tag">// LIMITED RUN</div>
              <h2>Specials</h2>
            </div>
            <Link to="/listing?filter=specials" className="view-all">
              View All &rarr;
            </Link>
          </div>
          {!loading && specials.length === 0 && (
            <p style={{ color: '#4A4A46', fontFamily: 'IBM Plex Mono, monospace', fontSize: '13px' }}>
              No products marked as Special yet — mark some from the Admin Panel.
            </p>
          )}
          <div className="prod-grid">
            {specials.map((p) => {
              const Icon = p.icon;
              return (
                <div className="prod-card" key={p.id}>
                  <div className="stamp sale">SALE</div>
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
        </div>
      </section>

      <section className="about" id="about">
        <div className="wrap">
          <div>
            <div className="tag" style={{ marginBottom: '12px' }}>
              // ABOUT J7 WINGS
            </div>
            <h2>Built for buyers who move volume.</h2>
            <p>
              J7 Wings supplies apparel, footwear, and crockery to
              dollar stores, discount retailers, gift shops, and independent grocers. Every
              listing ships in full case packs at reseller pricing &mdash; no minimums beyond
              your first invoice.
            </p>
            <div className="stat-row">
              <div className="stat">
                <div className="n">3</div>
                <div className="l">Core Categories</div>
              </div>
              <div className="stat">
                <div className="n">$500</div>
                <div className="l">Order Minimum</div>
              </div>
              <div className="stat">
                <div className="n">48HR</div>
                <div className="l">Dispatch Window</div>
              </div>
            </div>
          </div>
          <div className="manifest">
            <div className="row">
              <span className="k">ACCOUNT TYPE</span>
              <span className="v">RETAILER</span>
            </div>
            <div className="row">
              <span className="k">PAYMENT</span>
              <span className="v">CARD, INVOICE NET-15</span>
            </div>
            <div className="row">
              <span className="k">FREIGHT</span>
              <span className="v">FREE OVER $500</span>
            </div>
            <div className="row">
              <span className="k">CATALOG UPDATED</span>
              <span className="v">WEEKLY</span>
            </div>
            <div className="row">
              <span className="k">SUPPORT</span>
              <span className="v">MON&ndash;SAT, 9AM&ndash;6PM</span>
            </div>
          </div>
        </div>
      </section>

      <section className="newsletter">
        <div className="wrap">
          <div>
            <h3>Get new arrivals before they sell out.</h3>
            <p>Weekly catalog drops &mdash; straight to your inbox, no spam.</p>
          </div>
          <div className="nl-form">
            <input type="email" placeholder="Email address" />
            <button>Subscribe</button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
