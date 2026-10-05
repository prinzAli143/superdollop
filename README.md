# Superdollop

Cosmic landing page for Superdollop. A single button sends visitors to the
[superdollop-back](https://github.com/prinzAli143/superdollop-back) Python API,
which serves data stored in Supabase.

Static site: no build step needed.

```bash
python3 -m http.server 5173
```

Then open http://localhost:5173.

## Configuration

Set the API URL the button points to in `config.js`:

```js
window.SUPERDOLLOP_CONFIG = { apiUrl: "https://your-api.example.com" };
```

## Stack

- WebGL fragment shader: a domain-warped nebula plus parallax starfield that reacts to the cursor and scroll
- Plain HTML/CSS/JS, fonts from Google Fonts (Unbounded, Space Grotesk)
- Respects `prefers-reduced-motion`
