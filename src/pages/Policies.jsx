import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/Policies.css';
import Footer from '../components/Footer';
import CategoryNav from '../components/CategoryNav';

// One page, four sections (Terms & Conditions, Shipping Policy, Privacy
// Policy, FAQ). The footer links point here with a #hash
// (/policies#shipping etc.) and this page scrolls to that section on load
// or whenever the hash changes.
export default function Policies() {
  const { totalItems } = useCart();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        // Small delay so the page has finished laying out first.
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.hash]);

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
          <CategoryNav />
        </div>
      </header>

      <div className="breadcrumb">
        <div className="wrap">
          <Link to="/">Home</Link>
          <span className="sep">/</span>
          <span className="current">Policies &amp; FAQ</span>
        </div>
      </div>

      <section className="pol-hero">
        <div className="wrap">
          <div className="eyebrow">Policies &amp; Help</div>
          <h1>Terms, shipping, privacy, and frequently asked questions.</h1>
          <p>Everything you need to know before you order, all in one place.</p>
        </div>
      </section>

      <div className="pol-layout wrap">
        <aside className="pol-sidenav">
          <a href="#terms">Terms &amp; Conditions</a>
          <a href="#shipping">Shipping Policy</a>
          <a href="#privacy">Privacy Policy</a>
          <a href="#faq">FAQ</a>
        </aside>

        <div className="pol-content">
          <section id="terms" className="pol-section">
            <h2>Terms &amp; Conditions</h2>
            <p>
              By creating an account or placing an order on J7 Wings, you agree to the terms
              below. If anything is unclear, contact us before ordering.
            </p>
            <h3>Who can order</h3>
            <p>
              J7 Wings sells to registered retailers, shop owners, and resellers only &mdash;
              this is not a consumer storefront. All items ship in full case packs (CP), not
              individual pieces.
            </p>
            <h3>Orders &amp; minimum order</h3>
            <p>
              The minimum order value is <strong>$50</strong>. Orders are confirmed once payment
              is received or, for approved Net-15 accounts, once the order is placed. We reserve
              the right to adjust quantities or cancel an order if a listed item is out of stock
              at the time of fulfillment &mdash; you will always be notified first.
            </p>
            <h3>Pricing &amp; payment</h3>
            <p>
              Prices shown are per unit, charged by the case pack. We accept card payment at
              checkout and, for approved business accounts, Net-15 invoicing. All prices are
              subject to change without notice until an order is confirmed.
            </p>
            <h3>Limitation of liability</h3>
            <p>
              J7 Wings is not liable for indirect or consequential losses arising from delayed
              shipments, carrier issues, or manufacturing variations in product batches.
            </p>
          </section>

          <section id="shipping" className="pol-section">
            <h2>Shipping Policy</h2>
            <h3>Dispatch window</h3>
            <p>
              Orders are prepared and dispatched within <strong>48 hours</strong> of confirmation,
              Monday&ndash;Saturday. Orders placed on Sunday or a public holiday are processed the
              next business day.
            </p>
            <h3>Freight</h3>
            <p>
              Freight is calculated at checkout based on order weight and destination. Free
              freight applies automatically once an order qualifies &mdash; the threshold is
              shown at checkout.
            </p>
            <h3>Delivery &amp; damages</h3>
            <p>
              Delivery times vary by location and are provided by our shipping partners at
              checkout. If a shipment arrives damaged or short, contact us within 48 hours of
              delivery with photos so we can resolve it quickly.
            </p>
          </section>

          <section id="privacy" className="pol-section">
            <h2>Privacy Policy</h2>
            <h3>What we collect</h3>
            <p>
              We collect the information you provide when creating an account or placing an
              order &mdash; business name, contact details, shipping address, and order history.
            </p>
            <h3>How we use it</h3>
            <p>
              Your information is used to process orders, provide support, and share order and
              account updates. We do not sell your information to third parties.
            </p>
            <h3>Payment information</h3>
            <p>
              Card payments are processed securely through our payment provider &mdash; J7 Wings
              does not store your full card details on its own servers.
            </p>
            <h3>Contact</h3>
            <p>
              Questions about your data can be sent to us through the{' '}
              <Link to="/about">Contact page</Link>.
            </p>
          </section>

          <section id="faq" className="pol-section">
            <h2>Frequently Asked Questions</h2>

            <div className="pol-faq-item">
              <h3>Do you sell individual pieces?</h3>
              <p>No &mdash; every listing ships in a full case pack (CP), shown on each product.</p>
            </div>
            <div className="pol-faq-item">
              <h3>What's the minimum order?</h3>
              <p>$50 per order, across any mix of products.</p>
            </div>
            <div className="pol-faq-item">
              <h3>Do you offer Net-15 invoicing?</h3>
              <p>
                Yes, for approved business accounts. <Link to="/about">Contact us</Link> to apply.
              </p>
            </div>
            <div className="pol-faq-item">
              <h3>How long does dispatch take?</h3>
              <p>Within 48 hours of order confirmation, Monday&ndash;Saturday.</p>
            </div>
            <div className="pol-faq-item">
              <h3>Can I track my order?</h3>
              <p>
                Yes &mdash; once dispatched, your order status updates automatically and is
                visible from your account.
              </p>
            </div>
            <div className="pol-faq-item">
              <h3>Who do I contact for support?</h3>
              <p>
                Reach our team Mon&ndash;Sat, 9AM&ndash;6PM PKT, through the{' '}
                <Link to="/about">Contact page</Link>.
              </p>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </>
  );
}
