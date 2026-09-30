import { useEffect, useState } from 'react';
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

// Shared hook: live-syncs the "categories" Firestore collection so that every
// page (storefront nav, listing filters, and the admin product form) always
// shows the same, up-to-date list — and so that adding or deleting a category
// from the admin side actually persists and is reflected everywhere else
// immediately.
//
// Important: an empty "categories" collection is a valid, real state (the
// admin deleted everything) — it must never be auto-repopulated with
// defaults, or a deleted category can silently "come back".
export default function useCategories() {
  const [categories, setCategories] = useState([]); // [{ name, subCategories: [] }]
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
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
