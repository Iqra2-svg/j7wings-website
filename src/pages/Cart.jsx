import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/Cart.css';

const MIN_ORDER = 500;

export default function Cart() {
  const { cartItems, updateQty, removeItem, totalCases, totalUnits, subtotal, totalItems } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const total = subtotal; // freight free, no tax in this mock
  const remainingForMin = Math.max(0, MIN_ORDER - subtotal);

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
        </div>
      </header>

      <div className="breadcrumb">
        <div className="wrap">
          <Link to="/">Home</Link>
          <span className="sep">/</span>
          <span className="current">Cart</span>
        </div>
      </div>

      <div className="wrap">
        <div className="page-head">
          <div>
            <div className="tag">// REVIEW YOUR ORDER</div>
            <h1>Your Cart</h1>
          </div>
          <div className="item-count">
            {totalItems} ITEMS &middot; {totalCases} CASES
          </div>
        </div>

        <div className="steps">
          <div className="step active">
            <div className="dot">1</div> CART
          </div>
          <div className="step-line"></div>
          <div className="step">
            <div className="dot">2</div> CHECKOUT
          </div>
          <div className="step-line"></div>
          <div className="step">
            <div className="dot">3</div> CONFIRMATION
          </div>
        </div>

        <div className="cart-layout">
          <div>
            <div className="cart-table">
              <div className="cart-header-row">
                <span></span>
                <span>Item</span>
                <span>Price</span>
                <span>Quantity</span>
                <span>Total</span>
                <span></span>
              </div>

              {cartItems.length === 0 && (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#8A8577' }}>
                  Your cart is empty.
                </div>
              )}

              {cartItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div className="cart-item" key={item.id}>
                    <Link to={`/product/${item.id}`} className="item-thumb">
                      {Icon ? <Icon /> : null}
                    </Link>
                    <div>
                      <Link to={`/product/${item.id}`} className="item-name">
                        {item.name}
                      </Link>
                      <div className="item-meta">
                        <span>CP: {item.cp}</span>
                        <span>{item.itemNo}</span>
                      </div>
                    </div>
                    <div className="item-price">
                      ${item.price.toFixed(2)}
                      <span style={{ color: '#A6A196', fontSize: '10.5px' }}> /ea</span>
                    </div>
                    <div className="qty-stepper">
                      <button onClick={() => updateQty(item.id, -1)}>&minus;</button>
                      <input type="text" readOnly value={item.qty} />
                      <button onClick={() => updateQty(item.id, 1)}>+</button>
                    </div>
                    <div className="item-total">${(item.qty * item.price * item.cp).toFixed(2)}</div>
                    <button className="remove-btn" onClick={() => removeItem(item.id)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M3 6H21M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6H19Z"
                          stroke="#8A8577"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                );
              })}

              <div className="cart-footer-row">
                <Link to="/listing" className="continue-link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#16233F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>

          <div className="summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span className="k">
                Subtotal ({totalCases} cases, {totalUnits} units)
              </span>
              <span className="v">${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span className="k">Estimated Freight</span>
              <span className="v">FREE</span>
            </div>
            <div className="summary-row">
              <span className="k">Est. Tax</span>
              <span className="v">$0.00</span>
            </div>

            <div className="promo-row">
              <input type="text" placeholder="Promo code" />
              <button>Apply</button>
            </div>

            <div className="summary-row total">
              <span className="k">Total</span>
              <span className="v">${total.toFixed(2)}</span>
            </div>

            <button className="btn-checkout" disabled={cartItems.length === 0} onClick={handleCheckout}>
              Proceed to Checkout
            </button>
            {remainingForMin > 0 && (
              <div className="min-order-note">
                Add ${remainingForMin.toFixed(2)} more to reach the ${MIN_ORDER} order minimum
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
