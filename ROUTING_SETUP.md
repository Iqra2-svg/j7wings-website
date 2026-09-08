# App.jsx — Routing Setup

## What this file does
Wires up all 12 converted pages to URL routes using `react-router-dom`.

## Install (if not done yet)
```bash
npm install react-router-dom
```

## Where it goes
Copy `App.jsx` into your `src/` folder (same level as `src/pages/` and `src/styles/`).

Your `src/index.js` (React's entry point) should render it like this:
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

## Routes included

| Path | Page |
|---|---|
| `/` | Home |
| `/listing` or `/listing/:category` | Listing |
| `/product/:id` | ProductDetail |
| `/cart` | Cart |
| `/checkout` | Checkout |
| `/login` | Login |
| `/order-confirmation` or `/order-confirmation/:orderId` | OrderConfirmation |
| `/search` | SearchResults |
| `/about` | AboutContact |
| `/admin/login` | AdminLogin |
| `/admin/dashboard` | AdminDashboard |
| `/admin/products/new` or `/admin/products/:id/edit` | AdminProductForm |
| anything else | 404 page |

## One thing to fix next: links are still plain `<a>` tags

Right now every page uses `<a href="/">`, `<a href="/listing">`, etc. These work,
but they cause a **full page reload** every time — that defeats the purpose of using
React Router (fast, no-reload navigation).

Once routing is working end to end, go back through each page and swap:
```jsx
<a href="/listing">T-Shirts</a>
```
for:
```jsx
import { Link } from 'react-router-dom';
// ...
<Link to="/listing">T-Shirts</Link>
```

This is a mechanical find-and-replace — not urgent to do immediately, but do it
before final launch so navigation feels instant.

## Using the dynamic params later
`ProductDetail`, `Listing`, `AdminProductForm`, and `OrderConfirmation` now accept
URL params (`:id`, `:category`, `:orderId`). To read them inside those components:
```jsx
import { useParams } from 'react-router-dom';
// ...
const { id } = useParams();
```
You'll use this once Firestore is connected, to fetch the right product/order by ID.
