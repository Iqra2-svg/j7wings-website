import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/AboutContact.css';
import Footer from '../components/Footer';

// Simple static Careers page — no job-board/application system, since the
// business has no open roles to manage right now. Interested people are
// pointed to email a resume; update the "openings" list below whenever
// there's an actual role to post.
const openings = [
  // Example of how to add a real opening later:
  // { title: 'Warehouse Associate', location: 'Rawalpindi, PK', type: 'Full-Time' },
];

export default function Careers() {
  const { totalItems } = useCart();

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
          <span className="current">Careers</span>
        </div>
      </div>

      <section className="about-hero">
        <div className="wrap">
          <div className="eyebrow">Join The Team</div>
          <h1>Help us supply retailers across Pakistan.</h1>
          <p>
            J7 Wings is a small, growing team working directly with shop owners and
            resellers &mdash; no corporate layers, real responsibility from day one.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap" style={{ maxWidth: '680px' }}>
          {openings.length === 0 ? (
            <div className="manifest">
              <h3>// Current Openings</h3>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#4A4A46', lineHeight: 1.7, margin: '0 0 16px' }}>
                There are no open positions right now. We're a small team, and we post here
                as soon as that changes.
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#4A4A46', lineHeight: 1.7, margin: 0 }}>
                Still want to reach out? Send your resume and a short note about what you'd like
                to do to{' '}
                <a href="mailto:careers@j7wings.com" style={{ color: 'var(--navy)', fontWeight: 600 }}>
                  careers@j7wings.com
                </a>{' '}
                &mdash; we keep resumes on file for when a role opens up.
              </p>
            </div>
          ) : (
            <div className="values-grid">
              {openings.map((job) => (
                <div className="value-card" key={job.title}>
                  <h3>{job.title}</h3>
                  <p>
                    {job.location} &middot; {job.type}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
