# J7 Wings — Home Component (React)

## Files
- `src/pages/Home.jsx` — the converted React component
- `src/styles/Home.css` — all styling, extracted as-is from the original HTML

## One manual step required
The original file loaded Google Fonts via a `<link>` tag in `<head>`. React components
can't add `<head>` tags directly, so add this line to your `public/index.html`,
inside the `<head>` section:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

## How to use
1. Copy `Home.jsx` into `src/pages/`
2. Copy `Home.css` into `src/styles/`
3. Import and render it in your router, e.g.:

```jsx
import Home from './pages/Home';
// ...
<Route path="/" element={<Home />} />
```

## What changed from the HTML version
- `class` → `className`
- `stroke-width`, `stroke-linecap`, `stroke-linejoin` → `strokeWidth`, `strokeLinecap`, `strokeLinejoin`
- Inline `style="..."` strings → JS style objects (e.g. `style={{ paddingTop: 0 }}`)
- `<input>` self-closed (`<input ... />`)
- All product/category data is still hardcoded (same dummy data as the HTML version) —
  this is expected at this stage. Once Firebase is connected, this will be replaced with
  data fetched via `useEffect`/`useState`, per your project workflow.
