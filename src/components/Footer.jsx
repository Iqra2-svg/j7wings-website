import React from 'react';
import { Link } from 'react-router-dom';

// Shared site footer — used on every storefront page (NOT on admin pages).
// Import once per page: import Footer from '../components/Footer';
// and render <Footer /> where the old <footer>...</footer> block used to be.
export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <div className="logo-text">J7 WINGS</div>
            <p>
              Apparel, footwear &amp; crockery supply for retailers who buy by the
              case, not the piece.
            </p>
          </div>
          <div>
            <h4>Guidelines</h4>
            <ul>
              <li>
                <Link to="/policies#terms">Terms &amp; Conditions</Link>
              </li>
              <li>
                <Link to="/policies#shipping">Shipping Policy</Link>
              </li>
              <li>
                <Link to="/policies#privacy">Privacy Policy</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li>
                <Link to="/about">About Us</Link>
              </li>
              <li>
                <Link to="/about">Contact</Link>
              </li>
              <li>
                <a href="#">Careers</a>
              </li>
            </ul>
          </div>
          <div>
            <h4>Order Resources</h4>
            <ul>
              <li>
                <Link to="/listing">Bundles &amp; Deals</Link>
              </li>
              <li>
                <a href="#">Brand Directory</a>
              </li>
              <li>
                <a href="#">Weekly Catalog</a>
              </li>
            </ul>
          </div>
          <div>
            <h4>Interactive</h4>
            <ul>
              <li>
                <a href="#">Have Products to Sell?</a>
              </li>
              <li>
                <Link to="/feedback">Feedback</Link>
              </li>
              <li>
                <Link to="/policies#faq">FAQ</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <span>&copy; 2026 J7 Wings. All rights reserved.</span>
          <div className="socials">
            <a href="#">f</a>
            <a href="#">X</a>
            <a href="#">in</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
