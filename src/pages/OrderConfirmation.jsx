import React, { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase';
import { useCart } from '../context/CartContext';
import '../styles/OrderConfirmation.css';

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

function iconForItem(itemNo) {
  const num = parseInt(itemNo?.replace('#', ''), 10);
  if (num >= 20000 && num < 30000) return IconShoe;
  if (num >= 30000) return IconBowl;
  return IconTee;
}

const fulfillmentSteps = [
  { label: 'Order Placed', status: 'done' },
  { label: 'Processing', status: 'current' },
  { label: 'Dispatched', status: 'pending' },
  { label: 'Delivered', status: 'pending' },
];

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // If we just got redirected back from Stripe, verify the payment with
        // the server BEFORE trusting the order's status — the URL alone proves nothing.
        if (sessionId) {
          const confirmPayment = httpsCallable(functions, 'confirmPayment');
          const result = await confirmPayment({ sessionId, orderId });
          if (result.data.success) {
            clearCart();
          } else {
            setPaymentError('Your payment could not be confirmed. If you were charged, please contact support.');
          }
        }

        const snap = await getDoc(doc(db, 'orders', orderId));
        if (snap.exists()) {
          setOrder({ id: snap.id, ...snap.data() });
        } else {
          setOrder(null);
        }
      } catch (err) {
        console.error('Failed to fetch order:', err);
        setOrder(null);
      }
      setLoading(false);
    }
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, sessionId]);

  if (loading) {
    return (
      <div style={{ padding: '80px 24px', textAlign: 'center', fontFamily: 'IBM Plex Mono, monospace', color: '#8A8577' }}>
        {sessionId ? 'Confirming your payment\u2026' : 'Loading order\u2026'}
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '12px' }}>Order Not Found</h1>
        <p style={{ color: '#6E6A5F' }}>
          We couldn't find this order. <Link to="/">Back to homepage</Link>.
        </p>
      </div>
    );
  }

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  const shippingLabel =
    order.shippingMethod === 'express'
      ? 'Express Freight · 1–2 business days'
      : 'Standard Freight · 3–5 business days';

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
        </div>
      </header>

      <div className="steps">
        <div className="step">
          <div className="dot">&check;</div> CART
        </div>
        <div className="step-line"></div>
        <div className="step">
          <div className="dot">&check;</div> CHECKOUT
        </div>
        <div className="step-line"></div>
        <div className="step">
          <div className="dot">&check;</div> CONFIRMATION
        </div>
      </div>

      <div className="wrap">
        {paymentError && (
          <div
            style={{
              background: '#FBEDEB',
              border: '1px solid #E8A79D',
              color: '#B5361C',
              padding: '14px 18px',
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '13px',
              marginBottom: '20px',
            }}
          >
            {paymentError}
          </div>
        )}
        <div className="confirm-hero">
          <div className="stamp-circle">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M5 13L9 17L19 7" stroke="#2E6B4F" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1>{order.status === 'pending_payment' ? 'Payment Pending' : 'Order Confirmed'}</h1>
          <p>
            {order.status === 'pending_payment'
              ? "We haven't received payment confirmation for this order yet."
              : 'Thank you — your order has been received and is being processed.'}
          </p>
          <p>
            A confirmation has been sent to <strong>{order.email}</strong>
          </p>
          <div className="order-number">ORDER #{order.id}</div>
        </div>

        <div className="card">
          <h3>
            Fulfillment Status <span className="tag">EST. DISPATCH: 48HRS</span>
          </h3>
          <div className="tracker">
            {fulfillmentSteps.map((s) => (
              <div className={`t-step${s.status !== 'pending' ? ` ${s.status}` : ''}`} key={s.label}>
                <div className="t-dot">{s.status === 'done' ? <>&check;</> : fulfillmentSteps.indexOf(s) + 1}</div>
                <div className="t-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Order Details</h3>
          <div className="info-grid">
            <div className="info-block">
              <div className="k">Order Date</div>
              <div className="v">{orderDate}</div>
            </div>
            <div className="info-block">
              <div className="k">Payment Method</div>
              <div className="v mono">{order.paymentMethod === 'invoice' ? 'Invoice (Net-15)' : 'Card'}</div>
            </div>
            <div className="info-block">
              <div className="k">Shipping Address</div>
              <div className="v">
                {order.businessName}
                <br />
                {order.shippingAddress?.street}
                <br />
                {order.shippingAddress?.city}, {order.shippingAddress?.province} {order.shippingAddress?.postal}
              </div>
            </div>
            <div className="info-block">
              <div className="k">Shipping Method</div>
              <div className="v">{shippingLabel}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Items Ordered</h3>
          {(order.items || []).map((item) => {
            const Icon = iconForItem(item.itemNo);
            return (
              <div className="order-item" key={item.id}>
                <div className="item-thumb">
                  <Icon />
                </div>
                <div className="item-info">
                  <div className="item-name">{item.name}</div>
                  <div className="item-meta">
                    CP: {item.cp} &middot; {item.itemNo} &middot; Qty: {item.qty} case{item.qty > 1 ? 's' : ''}
                  </div>
                </div>
                <div className="item-price">${item.lineTotal.toFixed(2)}</div>
              </div>
            );
          })}

          <div className="totals">
            <div className="total-row">
              <span className="k">Subtotal</span>
              <span className="v">${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span className="k">Freight</span>
              <span className="v">{order.freight === 0 ? 'FREE' : `$${order.freight.toFixed(2)}`}</span>
            </div>
            <div className="total-row">
              <span className="k">Tax</span>
              <span className="v">$0.00</span>
            </div>
            <div className="total-row grand">
              <span className="k">Total Paid</span>
              <span className="v">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="action-row">
          <Link to="/">
            <button className="ordc-btn-outline">Continue Shopping</button>
          </Link>
          <button className="ordc-btn-primary">Download Invoice (PDF)</button>
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
