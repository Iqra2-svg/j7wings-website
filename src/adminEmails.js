// src/adminEmails.js
//
// Only emails listed here are allowed into the Admin Panel — this is checked
// AFTER Firebase confirms the password is correct, so a valid login alone
// isn't enough (this is what stops customer accounts from reaching /admin).
//
// To add a new admin, just add their email to this array. Keep it lowercase.

export const ADMIN_EMAILS = [
  'jawad353arif@gmail.com', // TODO: replace with the actual admin email(s) you added in Firebase Console
];

export function isAdminEmail(email) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
