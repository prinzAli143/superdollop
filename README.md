# Superdollop

Showcase site for Superdollop, a social media agency: one post a day for your business on
Instagram and LinkedIn. Launch offer: $300/month.

Static site, no build step:

```bash
python3 -m http.server 5173
```

Then open http://localhost:5173.

## Configuration (`config.js`)

| Key | Used by |
|---|---|
| `contactUrl` | "Get started" / "Claim the launch offer" buttons: a `mailto:` link, a booking page or a profile URL |
| `apiUrl` | "Client area" links: the [superdollop-back](https://github.com/prinzAli143/superdollop-back) back office |

## Assets

`assets/logo.webp` and the icons are cut out from the source logo (its checkerboard background was
baked into the JPG). `assets/og-image.jpg` is the social sharing preview.

## Stack

- WebGL nebula + parallax starfield reacting to the cursor and scroll (dims below the hero for readability)
- Plain HTML/CSS/JS, fonts from Google Fonts (Unbounded, Space Grotesk)
- Respects `prefers-reduced-motion`
