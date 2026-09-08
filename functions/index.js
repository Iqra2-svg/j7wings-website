// functions/index.js
//
// Two callable Cloud Functions that keep the Stripe Secret Key on the server,
// never in frontend code:
//
// 1. createCheckoutSession — the frontend calls this after saving the order
//    to Firestore (status: 'pending_payment'). It creates a Stripe Checkout
//    Session and returns the hosted payment page URL to redirect to.
//
// 2. confirmPayment — called from the Order Confirmation page after Stripe
//    redirects the customer back. It verifies the payment with Stripe
//    (never trusts the URL alone) and marks the Firestore order as 'paid'.

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const Stripe = require('stripe');

admin.initializeApp();
const db = admin.firestore();

const stripeSecretKey = defineSecret('STRIPE_SECRET_KEY');

exports.createCheckoutSession = onCall({ secrets: [stripeSecretKey] }, async (request) => {
  const { orderId, amount, currency, customerEmail, origin } = request.data;

  if (!orderId || !amount || !origin) {
    throw new HttpsError('invalid-argument', 'Missing orderId, amount, or origin.');
  }

  const stripe = Stripe(stripeSecretKey.value());

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: customerEmail || undefined,
    line_items: [
      {
        price_data: {
          currency: currency || 'eur',
          product_data: { name: `J7 Wings Order #${orderId.slice(0, 8).toUpperCase()}` },
          unit_amount: Math.round(amount * 100), // Stripe expects the smallest currency unit (cents)
        },
        quantity: 1,
      },
    ],
    metadata: { orderId },
    success_url: `${origin}/order-confirmation/${orderId}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout`,
  });

  return { url: session.url };
});

exports.confirmPayment = onCall({ secrets: [stripeSecretKey] }, async (request) => {
  const { sessionId, orderId } = request.data;

  if (!sessionId || !orderId) {
    throw new HttpsError('invalid-argument', 'Missing sessionId or orderId.');
  }

  const stripe = Stripe(stripeSecretKey.value());
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  // Make sure this session actually belongs to the order being confirmed —
  // never trust IDs coming from the URL alone.
  if (session.metadata.orderId !== orderId) {
    throw new HttpsError('permission-denied', 'This payment session does not match the order.');
  }

  if (session.payment_status === 'paid') {
    await db.collection('orders').doc(orderId).update({
      status: 'paid',
      paidAt: new Date().toISOString(),
      stripeSessionId: sessionId,
    });
    return { success: true };
  }

  return { success: false };
});
