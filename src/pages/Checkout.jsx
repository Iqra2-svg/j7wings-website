import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, auth, functions } from '../firebase';
import { useCart } from '../context/CartContext';
import '../styles/Checkout.css';

const SHIPPING_COST = { standard: 0, express: 25 };

export default function Checkout() {
  const { cartItems, subtotal, clearCart } = useCart();
  const [form, setForm] = useState({
    businessName: '',
    email: '',
    phone: '',
    accountType: 'Retailer',
    street: '',
    city: '',
    province: '',
    postal: '',
    country: 'Pakistan',
  });
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [payTab, setPayTab] = useState('card');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const updateField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const freight = SHIPPING_COST[shippingMethod];
  const total = subtotal + freight;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (cartItems.length === 0) return;

    // --- Contact Information ---
    if (!form.businessName.trim()) {
      setErrorMessage('Please enter your Business Name.');
      return;
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setErrorMessage('Please enter a valid Email Address.');
      return;
    }
    if (!form.phone.trim()) {
      setErrorMessage('Please enter your Phone Number.');
      return;
    }

    // --- Shipping Address ---
    if (!form.street.trim()) {
      setErrorMessage('Please enter your Street Address.');
      return;
    }
    if (!form.city.trim()) {
      setErrorMessage('Please enter your City.');
      return;
    }
    if (!form.province.trim()) {
      setErrorMessage('Please enter your Province.');
      return;
    }
    if (!form.postal.trim()) {
      setErrorMessage('Please enter your Postal Code.');
      return;
    }

    setPlacingOrder(true);
    try {
      const orderData = {
        customerUid: auth.currentUser ? auth.currentUser.uid : null,
        businessName: form.businessName,
        email: form.email,
        phone: form.phone,
        accountType: form.accountType,
        shippingAddress: {
          street: form.street,
          city: form.city,
          province: form.province,
          postal: form.postal,
          country: form.country,
        },
        shippingMethod,
        paymentMethod: payTab,
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          cp: item.cp,
          itemNo: item.itemNo,
          price: item.price,
          qty: item.qty,
          lineTotal: item.qty * item.price * item.cp,
        })),
        subtotal,
        freight,
        total,
        // 'card' orders start as pending_payment until Stripe confirms the charge;
        // invoice orders are approved orders from the start (paid later, net-15).
        status: payTab === 'card' ? 'pending_payment' : 'pending',
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);

      if (payTab === 'card') {
        // Hand off to Stripe's hosted Checkout page — card details are entered
        // there, never on this site, and the Secret Key never leaves the server.
        const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
        const result = await createCheckoutSession({
          orderId: docRef.id,
          amount: total,
          currency: 'eur',
          customerEmail: form.email,
          origin: window.location.origin,
        });
        window.location.href = result.data.url;
        return; // Cart is cleared after payment is confirmed, on the way back.
      }

      // Invoice (Net-15): no online payment needed right now.
      clearCart();
      navigate(`/order-confirmation/${docRef.id}`);
    } catch (err) {
      console.error('Failed to place order:', err);
      alert('Something went wrong placing your order. Please try again.');
      setPlacingOrder(false);
    }
  };

  return (
    <>
      <div className="topbar">
        <div className="wrap">
          <span>MIN. ORDER $500</span>
          <span>Need help? +92 300 000 0000</span>
        </div>
      </div>

      <header className="main">
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
          <div className="secure-note">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 6V11C4 16 7.5 20.5 12 22C16.5 20.5 20 16 20 11V6L12 2Z" stroke="#16233F" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
            Secure Checkout
          </div>
        </div>
      </header>

      <div className="wrap">
        <div className="steps">
          <div className="step done">
            <div className="dot">&check;</div> CART
          </div>
          <div className="step-line"></div>
          <div className="step active">
            <div className="dot">2</div> CHECKOUT
          </div>
          <div className="step-line"></div>
          <div className="step">
            <div className="dot">3</div> CONFIRMATION
          </div>
        </div>

        <form className="checkout-layout" onSubmit={handlePlaceOrder}>
          {errorMessage && (
            <div
              style={{
                gridColumn: '1 / -1',
                background: '#FBEDEB',
                border: '1px solid #E8A79D',
                color: '#B5361C',
                padding: '14px 18px',
                fontFamily: 'IBM Plex Mono, monospace',
                fontSize: '13px',
                marginBottom: '4px',
              }}
            >
              {errorMessage}
            </div>
          )}
          <div>
            <div className="form-card">
              <h3>
                <span className="num">1</span> Contact Information
              </h3>
              <div className="cko-field-row">
                <div className="cko-field">
                  <label>Business Name</label>
                  <input type="text" placeholder="e.g. Sunrise General Store" value={form.businessName} onChange={updateField('businessName')} />
                </div>
                <div className="cko-field">
                  <label>Email Address</label>
                  <input type="email" placeholder="you@business.com" value={form.email} onChange={updateField('email')} />
                </div>
              </div>
              <div className="cko-field-row">
                <div className="cko-field">
                  <label>Phone Number</label>
                  <input type="tel" placeholder="+92 3XX XXXXXXX" value={form.phone} onChange={updateField('phone')} />
                </div>
                <div className="cko-field">
                  <label>Account Type</label>
                  <select value={form.accountType} onChange={updateField('accountType')}>
                    <option>Retailer</option>
                    <option>Discount Store</option>
                    <option>Gift Shop</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-card">
              <h3>
                <span className="num">2</span> Shipping Address
              </h3>
              <div className="cko-field-row">
                <div className="cko-field full">
                  <label>Street Address</label>
                  <input type="text" placeholder="House / Street / Area" value={form.street} onChange={updateField('street')} />
                </div>
              </div>
              <div className="cko-field-row">
                <div className="cko-field">
                  <label>City</label>
                  <input type="text" placeholder="Rawalpindi" value={form.city} onChange={updateField('city')} />
                </div>
                <div className="cko-field">
                  <label>Province</label>
                  <input type="text" placeholder="Punjab" value={form.province} onChange={updateField('province')} />
                </div>
              </div>
              <div className="cko-field-row">
                <div className="cko-field">
                  <label>Postal Code</label>
                  <input type="text" placeholder="46000" value={form.postal} onChange={updateField('postal')} />
                </div>
                <div className="cko-field">
                  <label>Country</label>
                  <input type="text" value={form.country} onChange={updateField('country')} />
                </div>
              </div>
            </div>

            <div className="form-card">
              <h3>
                <span className="num">3</span> Shipping Method
              </h3>
              <div className="ship-options">
                <label className={`ship-option${shippingMethod === 'standard' ? ' selected' : ''}`}>
                  <div className="left">
                    <input type="radio" name="ship" checked={shippingMethod === 'standard'} onChange={() => setShippingMethod('standard')} />
                    <div>
                      <div className="name">Standard Freight</div>
                      <div className="eta">Dispatched within 48hrs &middot; 3&ndash;5 business days</div>
                    </div>
                  </div>
                  <div className="cost">FREE</div>
                </label>
                <label className={`ship-option${shippingMethod === 'express' ? ' selected' : ''}`}>
                  <div className="left">
                    <input type="radio" name="ship" checked={shippingMethod === 'express'} onChange={() => setShippingMethod('express')} />
                    <div>
                      <div className="name">Express Freight</div>
                      <div className="eta">Dispatched within 24hrs &middot; 1&ndash;2 business days</div>
                    </div>
                  </div>
                  <div className="cost">$25.00</div>
                </label>
              </div>
            </div>

            <div className="form-card">
              <h3>
                <span className="num">4</span> Payment
              </h3>
              <div className="pay-tabs">
                <button type="button" className={payTab === 'card' ? 'active' : ''} onClick={() => setPayTab('card')}>
                  Card
                </button>
                <button type="button" className={payTab === 'invoice' ? 'active' : ''} onClick={() => setPayTab('invoice')}>
                  Invoice (Net-15)
                </button>
              </div>

              {payTab === 'card' ? (
                <>
                  <div className="card-icons">
                    <span>VISA</span>
                    <span>MASTERCARD</span>
                    <span>AMEX</span>
                  </div>
                  <p style={{ fontSize: '13.5px', color: '#4A4A46', lineHeight: 1.7, marginBottom: '10px' }}>
                    You'll be redirected to Stripe's secure payment page to enter your card
                    details after clicking "Place Order" below.
                  </p>
                  <div className="stripe-note">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L4 6V11C4 16 7.5 20.5 12 22C16.5 20.5 20 16 20 11V6L12 2Z" stroke="#8A8577" strokeWidth="1.6" strokeLinejoin="round" />
                    </svg>
                    Payments are securely processed by Stripe &mdash; card details are never
                    entered or stored on our servers.
                  </div>
                </>
              ) : (
                <p style={{ fontSize: '13px', color: '#6E6A5F', lineHeight: 1.6 }}>
                  You'll receive an invoice by email, payable within 15 days. Available to
                  approved accounts.
                </p>
              )}
            </div>
          </div>

          <div className="summary">
            <h3>Order Summary</h3>

            {cartItems.map((item) => {
              const Icon = item.icon;
              return (
                <div className="mini-item" key={item.id}>
                  <div className="mini-thumb">
                    {Icon ? <Icon /> : null}
                  </div>
                  <div className="mini-info">
                    <div className="mini-name">{item.name}</div>
                    <div className="mini-meta">
                      Qty: {item.qty} case{item.qty > 1 ? 's' : ''} &middot; {item.itemNo}
                    </div>
                  </div>
                  <div className="mini-price">${(item.qty * item.price * item.cp).toFixed(2)}</div>
                </div>
              );
            })}

            <div className="summary-row" style={{ marginTop: '14px' }}>
              <span className="k">Subtotal</span>
              <span className="v">${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span className="k">Freight</span>
              <span className="v">{freight === 0 ? 'FREE' : `$${freight.toFixed(2)}`}</span>
            </div>
            <div className="summary-row">
              <span className="k">Est. Tax</span>
              <span className="v">$0.00</span>
            </div>
            <div className="summary-row total">
              <span className="k">Total Due</span>
              <span className="v">${total.toFixed(2)}</span>
            </div>

            <button type="submit" className="btn-place" disabled={placingOrder || cartItems.length === 0}>
              {placingOrder ? 'Placing Order...' : 'Place Order'}
            </button>
            <div className="lock-note">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="11" width="14" height="10" rx="1" stroke="#8A8577" strokeWidth="1.6" />
                <path d="M8 11V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V11" stroke="#8A8577" strokeWidth="1.6" />
              </svg>
              256-bit SSL encrypted &middot; PCI compliant
            </div>
          </div>
        </form>
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
