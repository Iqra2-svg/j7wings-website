import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useCart } from '../context/CartContext';
import '../styles/AboutContact.css';
import Footer from '../components/Footer';

export default function AboutContact() {
  const { totalItems } = useCart();
  const [form, setForm] = useState({
    fullName: '',
    businessName: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const updateField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSend = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.fullName.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in your name, email, and message.');
      return;
    }
    setSending(true);
    try {
      await addDoc(collection(db, 'inquiries'), {
        ...form,
        createdAt: new Date().toISOString(),
        status: 'new',
      });
      setSent(true);
      setForm({ fullName: '', businessName: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Something went wrong. Please try again.');
    }
    setSending(false);
  };

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
              <Link to="/about" className="current">
                About
              </Link>
            </nav>
            <div className="header-actions">
              <Link to="/login">Sign In</Link>
              <Link to="/cart">
                Cart <span className="cart-badge">{totalItems}</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="breadcrumb">
        <div className="wrap">
          <Link to="/">Home</Link>
          <span className="sep">/</span>
          <span className="current">About &amp; Contact</span>
        </div>
      </div>

      <section className="about-hero">
        <div className="wrap">
          <div className="eyebrow">About J7 Wings</div>
          <h1>Reliable supply, built on full case-pack pricing.</h1>
          <p>
            We help dollar stores, discount retailers, gift shops, and independent grocers stock
            apparel, footwear, and crockery without the markup of middlemen.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap about-grid">
          <div>
            <h2>Our Story</h2>
            <p>
              J7 Wings started as a small import operation supplying local retailers in
              Columba, Italy. Today we distribute apparel, footwear, and crockery to
              shop owners across the region &mdash; sourcing in bulk so our buyers never pay
              retail markup.
            </p>
            <p>
              Every listing on our site ships in a full case pack, priced for resellers. Our goal
              is simple: make it easy for small and mid-size retailers to stock shelves without
              dealing with a dozen separate suppliers.
            </p>
            <div className="stat-row">
              <div className="stat">
                <div className="n">3</div>
                <div className="l">Core Categories</div>
              </div>
              <div className="stat">
                <div className="n">$50</div>
                <div className="l">Order Minimum</div>
              </div>
              <div className="stat">
                <div className="n">48HR</div>
                <div className="l">Dispatch Window</div>
              </div>
            </div>
          </div>
          <div className="manifest">
            <h3>// Company Manifest</h3>
            <div className="row">
              <span className="k">FOUNDED</span>
              <span className="v">2024</span>
            </div>
            <div className="row">
              <span className="k">HEADQUARTERS</span>
              <span className="v">RAWALPINDI, PK</span>
            </div>
            <div className="row">
              <span className="k">SERVES</span>
              <span className="v">RETAILERS NATIONWIDE</span>
            </div>
            <div className="row">
              <span className="k">ACCOUNT TYPE</span>
              <span className="v">RETAILER</span>
            </div>
            <div className="row">
              <span className="k">SUPPORT HOURS</span>
              <span className="v">MON&ndash;SAT, 9AM&ndash;6PM</span>
            </div>
          </div>
        </div>
      </section>

      <section className="values-section section">
        <div className="wrap">
          <div className="section-head">
            <div className="tag">// WHY BUYERS CHOOSE US</div>
            <h2>What We Stand For</h2>
          </div>
          <div className="values-grid">
            <div className="value-card">
              <div className="num">01</div>
              <h3>Case-Pack Pricing</h3>
              <p>
                No retail markup. Every item is priced the way a reseller should see it &mdash;
                by the case, not the piece.
              </p>
            </div>
            <div className="value-card">
              <div className="num">02</div>
              <h3>Fast Dispatch</h3>
              <p>
                Orders are prepared and dispatched within 48 hours, with free freight on orders
                over $500.
              </p>
            </div>
            <div className="value-card">
              <div className="num">03</div>
              <h3>Direct Support</h3>
              <p>
                A real team you can call or message &mdash; not a ticket queue. We know our
                buyers by name.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap">
        <div className="contact-layout">
          <div className="contact-info">
            <h2>Get in Touch</h2>
            <p>
              Have a question about an order, a product, or opening an account? Reach
              out &mdash; we typically respond within one business day.
            </p>

            <div className="info-item">
              <div className="info-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22 6L12 13L2 6M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                    stroke="#16233F"
                    strokeWidth="1.6"
                  />
                </svg>
              </div>
              <div>
                <div className="label">Email</div>
                <div className="val">Support@j7wings.com</div>
                <div className="sub">For order and account queries</div>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22 16.9V19.9C22 20.5 21.5 21 20.9 21C10 21 3 14 3 3.1C3 2.5 3.5 2 4.1 2H7.1C7.6 2 8.1 2.4 8.1 2.9C8.2 4.1 8.5 5.3 8.9 6.4C9.1 6.9 8.9 7.5 8.5 7.8L6.9 9C8.1 11.6 10.4 13.9 13 15.1L14.2 13.5C14.5 13.1 15.1 12.9 15.6 13.1C16.7 13.5 17.9 13.8 19.1 13.9C19.6 14 20 14.4 20 14.9V16.9"
                    stroke="#16233F"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <div className="label">Phone</div>
                <div className="val">+39 3277454944</div>
                <div className="sub">Mon&ndash;Sat, 9AM&ndash;6PM PKT</div>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5 7 2 12 2C17 2 21 5 21 10Z"
                    stroke="#16233F"
                    strokeWidth="1.6"
                  />
                  <circle cx="12" cy="10" r="3" stroke="#16233F" strokeWidth="1.6" />
                </svg>
              </div>
              <div>
                <div className="label">Warehouse</div>
                <div className="val">Via Santa Colomba 2</div>
                <div className="sub">62010 Mogliano, Italy</div>
              </div>
            </div>
          </div>

          <form className="form-card" onSubmit={handleSend}>
            <h3>Send Us a Message</h3>
            <p className="sub">Fill out the form and our team will get back to you shortly.</p>

            {sent && (
              <p style={{ color: '#2E6B4F', fontSize: '13px', marginBottom: '14px', fontFamily: 'IBM Plex Mono, monospace' }}>
                Thanks — your message has been sent. We'll get back to you within one business day.
              </p>
            )}
            {error && (
              <p style={{ color: '#B5361C', fontSize: '13px', marginBottom: '14px', fontFamily: 'IBM Plex Mono, monospace' }}>
                {error}
              </p>
            )}

            <div className="abt-field-row">
              <div className="abt-field">
                <label>Full Name</label>
                <input type="text" placeholder="Your name" value={form.fullName} onChange={updateField('fullName')} />
              </div>
              <div className="abt-field">
                <label>Business Name</label>
                <input
                  type="text"
                  placeholder="Your store/business"
                  value={form.businessName}
                  onChange={updateField('businessName')}
                />
              </div>
            </div>
            <div className="abt-field-row">
              <div className="abt-field">
                <label>Email</label>
                <input type="email" placeholder="you@business.com" value={form.email} onChange={updateField('email')} />
              </div>
              <div className="abt-field">
                <label>Phone</label>
                <input type="tel" placeholder="+39 3XX XXXXXXX" value={form.phone} onChange={updateField('phone')} />
              </div>
            </div>
            <div className="abt-field-row">
              <div className="abt-field full">
                <label>Subject</label>
                <select value={form.subject} onChange={updateField('subject')}>
                  <option>General Inquiry</option>
                  <option>Order Support</option>
                  <option>Account Application</option>
                  <option>Product Availability</option>
                </select>
              </div>
            </div>
            <div className="abt-field-row">
              <div className="abt-field full">
                <label>Message</label>
                <textarea rows="4" placeholder="How can we help?" value={form.message} onChange={updateField('message')} />
              </div>
            </div>
            <button type="submit" className="abt-btn-primary" disabled={sending}>
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </>
  );
}
