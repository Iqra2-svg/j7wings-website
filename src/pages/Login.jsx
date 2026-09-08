import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import '../styles/Login.css';

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    businessName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const updateField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const friendlyError = (code) => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Try signing in instead.';
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Invalid email or password. Please try again.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      default:
        return 'Something went wrong. Please try again.';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (isSignup) {
      if (!form.businessName.trim() || !form.email || !form.password || !form.confirmPassword) {
        setErrorMessage('Please fill in all fields.');
        return;
      }
      if (form.password !== form.confirmPassword) {
        setErrorMessage("Passwords don't match.");
        return;
      }
    } else if (!form.email || !form.password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      if (isSignup) {
        const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
        await updateProfile(cred.user, { displayName: form.businessName.trim() });
        // Store the business profile in Firestore, keyed by the new user's uid.
        await setDoc(doc(db, 'customers', cred.user.uid), {
          businessName: form.businessName.trim(),
          email: form.email,
          createdAt: new Date().toISOString(),
        });
      } else {
        await signInWithEmailAndPassword(auth, form.email, form.password);
      }
      navigate('/');
    } catch (err) {
      console.error(isSignup ? 'Sign-up failed:' : 'Sign-in failed:', err.code);
      setErrorMessage(friendlyError(err.code));
    }
    setSubmitting(false);
  };

  return (
    <div className="page">
      <div className="brand-panel">
        <Link to="/" className="logo">
          <div className="logo-mark">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 12L11 9L12 2L13 9L22 12L13 15L12 22L11 15L2 12Z" fill="#16233F" />
            </svg>
          </div>
          <div className="logo-text">
            J7 WINGS
            <span>Wholesale Supply Co.</span>
          </div>
        </Link>

        <div className="brand-mid">
          <div className="eyebrow">Buyer Access</div>
          <h1>Your account, your case-pack pricing.</h1>
          <p>
            Sign in to view wholesale rates, reorder past invoices, and track dispatch status on
            every order.
          </p>
        </div>

        <div className="manifest">
          <div className="row">
            <span className="k">ACCOUNT TYPE</span>
            <span className="v">WHOLESALE / RESELLER</span>
          </div>
          <div className="row">
            <span className="k">MIN. ORDER</span>
            <span className="v">$500</span>
          </div>
          <div className="row">
            <span className="k">SUPPORT</span>
            <span className="v">MON&ndash;SAT, 9AM&ndash;6PM</span>
          </div>
        </div>

        <div className="crate-tag" style={{ top: '60px', right: '56px' }}>
          <div className="k">Item #10001</div>
          <div className="v">In Stock &middot; CP 12</div>
        </div>
      </div>

      <div className="form-panel">
        <form className={`form-box${isSignup ? ' signup-active' : ''}`} onSubmit={handleSubmit}>
          <div className="form-tabs">
            <button type="button" className={!isSignup ? 'active' : ''} onClick={() => setIsSignup(false)}>
              Sign In
            </button>
            <button type="button" className={isSignup ? 'active' : ''} onClick={() => setIsSignup(true)}>
              Create Account
            </button>
          </div>

          <h2>{isSignup ? 'Create your account' : 'Welcome back'}</h2>
          <p className="form-sub">
            {isSignup ? 'Set up wholesale access in under a minute.' : 'Sign in to your wholesale account to continue.'}
          </p>

          {errorMessage && (
            <p style={{ color: '#B5361C', fontSize: '13px', marginBottom: '16px', fontFamily: 'IBM Plex Mono, monospace' }}>
              {errorMessage}
            </p>
          )}

          <div className="signup-fields">
            <div className="lgn-field">
              <label>Business Name</label>
              <input
                type="text"
                placeholder="e.g. Sunrise General Store"
                value={form.businessName}
                onChange={updateField('businessName')}
              />
            </div>
          </div>

          <div className="lgn-field">
            <label>Email Address</label>
            <input type="email" placeholder="you@business.com" value={form.email} onChange={updateField('email')} />
          </div>

          <div className="lgn-field">
            <label>Password</label>
            <div className="pass-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                value={form.password}
                onChange={updateField('password')}
              />
              <span className="toggle" onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? 'HIDE' : 'SHOW'}
              </span>
            </div>
          </div>

          <div className="signup-fields">
            <div className="lgn-field">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                value={form.confirmPassword}
                onChange={updateField('confirmPassword')}
              />
            </div>
          </div>

          {!isSignup && (
            <div className="row-between login-only">
              <label className="remember">
                <input type="checkbox" /> Remember me
              </label>
              <a href="#" className="forgot">
                Forgot password?
              </a>
            </div>
          )}

          <button type="submit" className="lgn-btn-primary" disabled={submitting}>
            {submitting ? (isSignup ? 'Creating Account...' : 'Signing In...') : isSignup ? 'Create Account' : 'Sign In'}
          </button>

          <div className="divider">Wholesale Buyers</div>

          <div className="wholesale-note">
            <strong>New to J7 Wings?</strong> Creating an account gives you access to case-pack
            pricing and order tracking. Approval is instant for verified businesses &mdash;{' '}
            <a href="#">learn more</a>.
          </div>
        </form>
      </div>
    </div>
  );
}
