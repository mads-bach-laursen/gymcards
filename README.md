# GymCards

Skalerbart træningskort-galleri – statiske filer, ingen build.

## Struktur

```
index.html        Oversigt med søgning + kategori-filter
card.html         Detaljeside, drevet af ?id=E1
data/cards.json   Alle kort + kategorier (single source of truth)
images/           Billeder, navngivet efter kort-ID (E1.jpg, F2.jpg…)
assets/
  style.css       Design (Barlow Condensed + Barlow)
  data.js         Fælles fetch + cache
  app.js          Oversigt
  card.js         Detaljeside
netlify.toml      Publish + cache-headers
```

## Tilføj et kort

1. Læg billede i `images/` (fx `E3.jpg`).
2. Tilføj objekt i `data/cards.json`:
   ```json
   { "id": "E3", "category": "E", "title": "...", "image": "images/E3.jpg", ... }
   ```

## Kategorier

| Nøgle | Navn   | Farve     |
|-------|--------|-----------|
| E     | Energi | `#1D9E75` |
| F     | Force  | `#0077B6` |
| P     | Power  | `#FFB703` |

Definitionerne lever i `data/cards.json` under `categories` – tilføj flere efter behov.

## Lokalt

Filerne er statiske ES-modules og skal serveres over HTTP (ikke `file://`):

```sh
python3 -m http.server 8000
# → http://localhost:8000
```

## Deploy

- Dev: [gymcards-dev.netlify.app](https://gymcards-dev.netlify.app) (site `38aed89a-1444-470c-90c2-22b5fc91c4ab`)
- Prod: [gymcards.netlify.app](https://gymcards.netlify.app) – **må ikke røres**
