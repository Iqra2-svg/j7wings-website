import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { isAdminEmail } from '../adminEmails';

// Wrap any admin page with this to require a signed-in Firebase user whose
// email is on the admin allowlist — a valid login alone isn't enough,
// otherwise any customer account could reach these pages via direct URL.
export default function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // onAuthStateChanged fires once immediately with the current state,
    // then again whenever sign-in/sign-out happens.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setIsAuthorized(Boolean(firebaseUser) && isAdminEmail(firebaseUser.email));
      setChecking(false);
    });
    return unsubscribe;
  }, []);

  if (checking) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'IBM Plex Mono, monospace',
          color: '#8A8577',
          background: '#F3F1EC',
        }}
      >
        Checking access&hellip;
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
