import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useCart } from '../context/CartContext';
import '../styles/AboutContact.css';
import Footer from '../components/Footer';

// Simple feedback form — stores submissions in the "feedback" Firestore
// collection (separate from "inquiries", which is the Contact Us form).
export default function Feedback() {
  const { totalItems } = useCart();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    rating: 'Good',
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
      setError('Please fill in your name, email, and feedback.');
      return;
    }
    setSending(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        ...form,
        createdAt: new Date().toISOString(),
        status: 'new',
      });
      setSent(true);
      setForm({ fullName: '', email: '', rating: 'Good', message: '' });
    } catch (err) {
      console.error('Failed to send feedback:', err);
      setError('Something went wrong. Please try again.');
    }
    setSending(false);
  };

  return (
    <>
      <div className="topbar">
        <div className="wrap">
          <span>MIN. ORDER $50</span>
          <span>
            <Link to="/about">Contact Us</Link>
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
              <div className="logo-text">J7 WINGS</div>
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
        </div>
      </header>

      <div className="breadcrumb">
        <div className="wrap">
          <Link to="/">Home</Link>
          <span className="sep">/</span>
          <span className="current">Feedback</span>
        </div>
      </div>

      <section className="about-hero">
        <div className="wrap">
          <div className="eyebrow">We're Listening</div>
          <h1>Tell us how we're doing.</h1>
          <p>
            Good or bad, your feedback helps us fix problems faster and improve the buying
            experience for every retailer we work with.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap" style={{ maxWidth: '640px' }}>
          <form className="form-card" onSubmit={handleSend}>
            <h3>Share Your Feedback</h3>
            <p className="sub">This goes straight to our team &mdash; no account needed.</p>

            {sent && (
              <p style={{ color: '#2E6B4F', fontSize: '13px', marginBottom: '14px', fontFamily: 'IBM Plex Mono, monospace' }}>
                Thanks for the feedback &mdash; we really appreciate it.
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
                <label>Email</label>
                <input type="email" placeholder="you@business.com" value={form.email} onChange={updateField('email')} />
              </div>
            </div>
            <div className="abt-field-row">
              <div className="abt-field full">
                <label>Overall Experience</label>
                <select value={form.rating} onChange={updateField('rating')}>
                  <option>Excellent</option>
                  <option>Good</option>
                  <option>Average</option>
                  <option>Poor</option>
                </select>
              </div>
            </div>
            <div className="abt-field-row">
              <div className="abt-field full">
                <label>Your Feedback</label>
                <textarea
                  rows="5"
                  placeholder="What worked well, and what should we improve?"
                  value={form.message}
                  onChange={updateField('message')}
                />
              </div>
            </div>
            <button type="submit" className="abt-btn-primary" disabled={sending}>
              {sending ? 'Sending...' : 'Send Feedback'}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </>
  );
}
