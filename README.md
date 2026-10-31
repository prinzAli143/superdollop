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

`assets/logo.webp` and the icons come from the source logo: its baked checkerboard was removed and
the inside of the ring filled with navy so it reads on the light page. `assets/og-image.jpg` is the
social sharing preview. Asset URLs in `index.html` carry a `?v=` number: bump it when they change.

## Stack

- Plain HTML/CSS/JS, light agency layout: services, how it works, example posts, pricing
- Font from Google Fonts (Plus Jakarta Sans)
- Respects `prefers-reduced-motion`
