import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

// Shared horizontal category bar — used on every storefront page in place of
// the old "ALL CATEGORIES" dropdown button. Category names sit in a row;
// hovering one shows its sub-categories underneath. Reads the same Firestore
// "categories" collection the admin manages, so it's always up to date.
export default function CategoryNav() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        const list = snapshot.docs
          .map((d) => ({ name: d.data().name || d.id, subCategories: d.data().subCategories || [] }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCategories(list);
      },
      (err) => console.error('Failed to load categories:', err)
    );
    return () => unsub();
  }, []);

  const goToCategory = (category, sub) => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (sub) params.set('sub', sub);
    navigate(`/listing${params.toString() ? `?${params.toString()}` : ''}`);
  };

  if (categories.length === 0) return null;

  return (
    <nav className="catnav">
      {categories.map((cat) => (
        <div className="catnav-item" key={cat.name}>
          <span className="catnav-label" onClick={() => goToCategory(cat.name)}>
            {cat.name}
          </span>
          {cat.subCategories.length > 0 && (
            <div className="catnav-drop">
              {cat.subCategories.map((sub) => (
                <span key={sub} className="catnav-drop-link" onClick={() => goToCategory(cat.name, sub)}>
                  {sub}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
