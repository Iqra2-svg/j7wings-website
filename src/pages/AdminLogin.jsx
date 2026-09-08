import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { isAdminEmail } from '../adminEmails';
import '../styles/AdminLogin.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('Invalid email or password. Please try again.');
  const [signingIn, setSigningIn] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      setShowError(true);
      return;
    }

    setSigningIn(true);
    setShowError(false);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);

      // Password was correct, but only allowlisted emails may enter the admin panel.
      if (!isAdminEmail(cred.user.email)) {
        await signOut(auth);
        setErrorMessage('This account does not have admin access.');
        setShowError(true);
        setSigningIn(false);
        return;
      }

      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Admin sign-in failed:', err.code);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setErrorMessage('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMessage('Too many attempts. Please wait a moment and try again.');
      } else {
        setErrorMessage('Something went wrong. Please try again.');
      }
      setShowError(true);
    }
    setSigningIn(false);
  };

  return (
    <div className="page">
      <div className="login-shell">
        <div className="brand-row">
          <div className="logo-mark">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 12L11 9L12 2L13 9L22 12L13 15L12 22L11 15L2 12Z" fill="#16233F" />
            </svg>
          </div>
          <div className="logo-text">J7 WINGS</div>
          <div className="logo-sub">Admin Console</div>
        </div>

        <form className="card" onSubmit={handleSubmit}>
          <div className="card-head">
            <h2>Admin Sign In</h2>
            <span className="restricted-tag">Restricted</span>
          </div>
          <p className="card-sub">This area is for authorized J7 Wings staff only.</p>

          <div className={`error-note${showError ? ' show' : ''}`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18C1.64 18.32 1.55 18.68 1.55 19.04C1.55 20.13 2.43 21 3.51 21H20.49C20.85 21 21.21 20.91 21.53 20.73C22.47 20.19 22.79 18.99 22.25 18.05L13.78 3.86C13.6 3.53 13.34 3.27 13.01 3.09C12.07 2.56 10.87 2.88 10.29 3.86Z"
                stroke="#E8A79D"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {errorMessage}
          </div>

          <div className="adl-field">
            <label>Admin Email</label>
            <input
              type="email"
              placeholder="admin@j7wings.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="adl-field">
            <label>Password</label>
            <div className="pass-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="toggle" onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? 'HIDE' : 'SHOW'}
              </span>
            </div>
          </div>

          <div className="row-between">
            <label className="remember">
              <input type="checkbox" /> Keep me signed in
            </label>
            <a href="#" className="forgot">
              Forgot password?
            </a>
          </div>

          <button type="submit" className="adl-btn-primary" disabled={signingIn}>
            {signingIn ? 'Signing In...' : 'Sign In to Admin'}
          </button>

          <div className="divider">Security</div>
          <div className="security-note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="11" width="14" height="10" rx="1" stroke="#59647C" strokeWidth="1.6" />
              <path d="M8 11V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V11" stroke="#59647C" strokeWidth="1.6" />
            </svg>
            <span>
              All sign-in attempts are logged. This console is protected by Firebase
              Authentication and limited to whitelisted admin accounts only.
            </span>
          </div>

          <div className="manifest-strip">
            <span>SESSION: SECURE</span>
            <span>ENV: PRODUCTION</span>
          </div>
        </form>

        <Link to="/" className="back-link">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#8892A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to storefront
        </Link>
      </div>
    </div>
  );
}
