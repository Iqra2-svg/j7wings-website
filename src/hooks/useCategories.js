import { useEffect, useRef, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '../firebase';

// The starting categories, used only to seed Firestore the very first time the
// app runs (i.e. the "categories" collection doesn't exist yet). After that,
// everything lives in Firestore and this list is never referenced again.
const DEFAULT_CATEGORIES = {
  'T-Shirts': ["Men's T-Shirts", "Women's T-Shirts", 'Kids T-Shirts', 'Graphic Tees', 'Plain/Basic Tees'],
  Shoes: ["Men's Shoes", "Women's Shoes", 'Kids Shoes', 'Sports/Sneakers', 'Sandals'],
  Crockery: ['Plates', 'Bowls', 'Dinner Sets', 'Serving Platters', 'Drinking Glasses', 'Mugs', 'Tea Sets', 'Cups & Saucers'],
};

// Shared hook: live-syncs the "categories" Firestore collection so that every
// page (storefront nav, listing filters, and the admin product form / admin
// categories page) always shows the same, up-to-date list — and so that
// adding or deleting a category from the admin side actually persists and is
// reflected everywhere else immediately.
export default function useCategories() {
  const [categories, setCategories] = useState([]); // [{ name, subCategories: [] }]
  const [loading, setLoading] = useState(true);
  const seeded = useRef(false);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'categories'),
      async (snapshot) => {
        if (snapshot.empty && !seeded.current) {
          seeded.current = true;
          // First time ever running with a categories collection — create the
          // default set once. Harmless if this ever runs twice (setDoc just
          // overwrites with the same data).
          await Promise.all(
            Object.entries(DEFAULT_CATEGORIES).map(([name, subCategories]) =>
              setDoc(doc(db, 'categories', name), { name, subCategories })
            )
          );
          return; // the write above triggers this onSnapshot again with real data
        }
        const list = snapshot.docs
          .map((d) => ({ name: d.data().name || d.id, subCategories: d.data().subCategories || [] }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCategories(list);
        setLoading(false);
      },
      (err) => {
        console.error('Failed to load categories:', err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const subCategoriesMap = categories.reduce((acc, c) => {
    acc[c.name] = c.subCategories;
    return acc;
  }, {});
  const mainCategoryOptions = categories.map((c) => c.name);

  const addMainCategory = async (name) => {
    const clean = name.trim();
    if (!clean) return;
    await setDoc(doc(db, 'categories', clean), { name: clean, subCategories: [] }, { merge: true });
  };

  const addSubCategory = async (mainCategory, sub) => {
    const clean = sub.trim();
    if (!clean || !mainCategory) return;
    await setDoc(
      doc(db, 'categories', mainCategory),
      { name: mainCategory, subCategories: arrayUnion(clean) },
      { merge: true }
    );
  };

  const deleteMainCategory = async (name) => {
    await deleteDoc(doc(db, 'categories', name));
  };

  const deleteSubCategory = async (mainCategory, sub) => {
    await updateDoc(doc(db, 'categories', mainCategory), { subCategories: arrayRemove(sub) });
  };

  return {
    categories,
    subCategoriesMap,
    mainCategoryOptions,
    loading,
    addMainCategory,
    addSubCategory,
    deleteMainCategory,
    deleteSubCategory,
  };
}
