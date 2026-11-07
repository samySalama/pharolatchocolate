# Pharolat Chocolate — Website

The official website for **Pharolat Chocolate** (فارولات شوكولاتة), a premium Egyptian chocolate brand. It is a bilingual (Arabic / English) product catalogue where customers choose a flavour and a chocolate type (Milk or Dark) and place their order through WhatsApp.

The website is a **static site**: plain HTML, CSS and JavaScript. It has no framework, no backend, no database, no cart and no payment system.

---

## 1. Main features

- **Bilingual interface.** The page opens in Arabic (right-to-left). The **AR / EN** button switches the whole page, including text, layout direction, page title, meta description and image alt text.
- **Product catalogue.** 11 flavours, grouped into three collections: *Nuts*, *Creamy & Spreads*, and *Coffee & Specials*.
- **WhatsApp ordering.** Every price button opens WhatsApp with a message that already contains the flavour, the chocolate type and the price.
- **Photo showcase.** A horizontal strip of four photographs with previous/next buttons. It also works with touch swipe and the keyboard.
- **Responsive design.** Designed mobile-first and tested at 360, 390, 430, 768, 1024 and 1440 pixels.
- **Accessibility basics.** Skip link, visible focus outlines, alt text on every image, and support for the "reduce motion" system setting.
- **Fixed mobile order bar.** On phones, a "Order on WhatsApp" bar stays at the bottom of the screen.

**Prices** (fixed by the business): Milk **130 EGP**, Dark **120 EGP**.

---

## 2. Technologies

| Technology | Used for |
|---|---|
| HTML5 | Page structure (`index.html`) |
| CSS3 (custom properties, Grid, Flexbox, scroll-snap) | Design, layout and responsive behaviour (`styles.css`) |
| Vanilla JavaScript (ES2015+) | Product list, rendering, language switching, showcase buttons (`script.js`) |
| SVG | Brand logo/icon (`brand-logo.svg`) |
| WebP | Product and showcase photographs (`assets/images/`) |
| Google Fonts | Typefaces, loaded from the internet (see section 9) |
| GitHub Pages | Hosting (static files, no build) |

There are **no npm packages, no build tools and no frameworks**. The only optional tooling is the browser test in `tests/`, which needs Python and Playwright.

---

## 3. Project folder structure

```
pharolat-chocolate/
├── index.html            Page structure and all fixed text (Arabic and English)
├── styles.css            All styling: colours, fonts, layout, responsive rules
├── script.js             Product list, prices, WhatsApp links, language switch
├── brand-logo.svg        Brand icon (used as the browser tab icon)
├── README.md             This file
├── DEVELOPMENT_GUIDE.md  Architecture and rules for developers
├── .gitignore            Files Git should ignore (system junk files)
├── .nojekyll             Tells GitHub Pages not to run Jekyll (keep this file)
├── assets/
│   └── images/
│       ├── hero/         Main banner photo (WebP, 800 and 1600 px)
│       ├── products/     One photo per flavour that has one (WebP)
│       └── carousel/     Four unlabelled photos for the showcase strip (WebP)
└── tests/
    └── browser_test.py   Automated browser test (optional, see section 8)
```

**Important:** keep every path **relative** (for example `assets/images/...`, never `/assets/...`). This is what makes the site work on GitHub Pages sub-folders.

---

## 4. Requirements

- A modern web browser (Chrome, Edge, Firefox, Safari).
- An internet connection for the Google Fonts (the site still works without it, using fallback fonts).
- **To run locally:** nothing else is required. You can open `index.html` directly, or use the optional local server in section 5.
- **To run the automated test (optional):** Python 3.9+ and Playwright (see section 8).

---

## 5. Run the website locally

### Option A — open the file directly
*Note: this method has not been tested by the developers. Option B is the tested method.*
1. Unzip `pharolat-chocolate-FINAL.zip`.
2. Open the `pharolat-chocolate` folder.
3. Double-click `index.html`.

### Option B — run a small local server (recommended)
This is closer to how GitHub Pages serves the site.

1. Open a terminal inside the `pharolat-chocolate` folder.
   - Windows: open the folder in File Explorer, click the address bar, type `cmd` and press Enter.
   - macOS / Linux: open Terminal and use `cd` to move into the folder.
2. Start the server:
   ```bash
   python3 -m http.server 8000
   ```
   (On Windows you may need `python -m http.server 8000`.)
3. Open your browser at **http://localhost:8000/** .
4. To stop the server, press `Ctrl + C` in the terminal.

---

## 6. Build and deploy

### Build
**There is no build step.** The project folder is already the finished website. Do not run `npm install` or `npm run build`; there is no `package.json`.

### Deploy to GitHub Pages
1. Create a new repository on GitHub, for example `pharolat-chocolate`.
2. Upload the **contents** of the `pharolat-chocolate` folder to the **root** of the repository (so `index.html` sits at the top level, not inside another folder). Keep the hidden `.nojekyll` file.
   - Using the GitHub website: *Add file → Upload files*, select everything inside the folder, and commit.
   - Using Git from a terminal:
     ```bash
     cd pharolat-chocolate
     git init
     git add .
     git commit -m "Initial website"
     git branch -M main
     git remote add origin https://github.com/YOUR-USERNAME/pharolat-chocolate.git
     git push -u origin main
     ```
3. On GitHub, open the repository and go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, select branch **main** and folder **/ (root)**, then click **Save**.
5. Wait one or two minutes, then open the address shown on the Pages settings page.

**Note:** pushing to GitHub publishes the site. Only do this when the business has approved the content.

---

## 7. Editing the website

### 7.1 Text on the page (headings, buttons, labels)
Most fixed text is in `index.html`. Each piece of bilingual text uses two attributes:

```html
<a href="#collection" data-copy-en="The collection" data-copy-ar="التشكيلة">التشكيلة</a>
```

- `data-copy-en` = English text, shown when the page is in English.
- `data-copy-ar` = Arabic text, shown when the page is in Arabic.
- The text between the tags is the default (Arabic) text. Keep all three in sync.

To change a sentence, edit **both** `data-copy-en` and `data-copy-ar`, and the text between the tags.

### 7.2 Product names, Arabic names, and descriptions
Products live in the `PRODUCTS` list at the top of `script.js`. Example entry:

```js
{ en: 'LOTUS', ar: 'لوتس', group: 'creamy',
  photo: { src: IMG + 'lotus-800.webp', srcset: IMG + 'lotus-800.webp 800w, ' + IMG + 'lotus-1600.webp 1600w' },
  alt: { en: 'Chocolate with biscuit-crumb filling', ar: 'شوكولاتة بحشوة بسكويت مفتت' } },
```

- `en` / `ar`: the product name in each language.
- `group`: which collection the product belongs to (see section 10).
- `photo`: the image. Use `photo: null` for a text-only card (no photo yet).
- `alt`: a short description of what **is visible** in the photo, in both languages.

Product **descriptions were removed on purpose.** Do not add ingredient or manufacturing claims unless the business has verified them.

### 7.3 Prices
Prices are set in **two places**. Change both:

1. `script.js`, near the top: `const PRICES = { Milk: 130, Dark: 120 };`
2. `index.html`, in the collection heading text: `Milk 130 EGP · Dark 120 EGP` (both the English and Arabic versions, written as `ميلك ١٣٠ جنيه · دارك ١٢٠ جنيه`).

Prices shown on the cards and inside WhatsApp messages come from `PRICES` automatically.

### 7.4 Images
- Photos are in `assets/images/`. They should be **WebP**, with a **4:5** aspect ratio for product cards.
- Save two sizes per photo, for example `lotus-800.webp` and `lotus-1600.webp`, then reference both (see section 7.2).
- Give each file a descriptive lowercase name with hyphens (for example `cotton-candy-800.webp`).
- Add or change the photo in the product's `photo` entry in `script.js`.
- The hero photo is set in `index.html` (`<img>` inside `.hero-media`). The showcase photos are set in the `SHOWCASE` list in `script.js`.
- **Do not use unrelated photos to fill a missing product.** Use `photo: null` instead.

### 7.5 Colours
All colours are CSS variables at the top of `styles.css`, inside `:root`:

```css
:root {
  --espresso: #100C09;   /* darkest brown, used for the closing band */
  --cocoa: #3C251D;      /* main text and dark buttons */
  --gold: #BD9254;
  --paper: #FFFAF4;      /* main background */
  --ivory: #F5EFE5;      /* alternate section background */
  ...
}
```

Change a value once here and it updates across the whole site. Keep enough contrast between text and background.

### 7.6 Fonts
Fonts are loaded in two places. Change both if you change a font:
1. `index.html`, the `<link href="https://fonts.googleapis.com/css2?...">` line in `<head>`.
2. `styles.css`, the font variables in `:root`: `--serif`, `--sans`, `--arabic` and `--arabic-display`.

Each variable is a list. The first font is used; the others are fallbacks if the first is unavailable.

### 7.7 Brand name and social links
- Brand name: search for `Pharolat` (English) and `فارولات` (Arabic) in `index.html` and `script.js`.
- Instagram: `https://www.instagram.com/pharolat_choclate/` appears in the footer of `index.html`, twice.

---

## 8. Running the browser tests (optional)

The file `tests/browser_test.py` opens the real site in Chromium and checks products, prices, WhatsApp links, language switching, horizontal overflow at six widths, images and the showcase. It prints a JSON report.

1. Install Python 3.9+ and then:
   ```bash
   pip install playwright
   python -m playwright install chromium
   ```
2. Start the local server (section 5, Option B) in one terminal.
3. In a second terminal, from the project folder:
   - macOS / Linux:
     ```bash
     SITE_URL=http://localhost:8000/index.html python3 tests/browser_test.py
     ```
   - Windows PowerShell:
     ```powershell
     $env:SITE_URL="http://localhost:8000/index.html"; python tests/browser_test.py
     ```
4. The test expects the 11 product names and the prices described above. If you change a product name or price on purpose, update the expected values in the test as well.

---

## 9. Arabic and English support

- The page's language is stored in `<html lang="…" dir="…">`. The switch sets `lang="en"` with `dir="ltr"`, or `lang="ar"` with `dir="rtl"`.
- Fixed text uses `data-copy-en` / `data-copy-ar` (section 7.1).
- Dynamic text (product names, card labels, WhatsApp messages) is built in `script.js`, where each function checks the current language.
- Alt text uses `data-alt-en` / `data-alt-ar` on images in `index.html`, and an `alt` pair for each product and showcase photo in `script.js`.
- Arabic font families are set in `styles.css` (`--arabic`, `--arabic-display`).
- When you add English or Arabic text, **always add both versions.** Missing one language will show the wrong text after switching.

---

## 10. Adding products and collections

### Add a product
1. Add an entry to `PRODUCTS` in `script.js`, following the example in section 7.2.
2. Set `group` to an existing collection id: `nuts`, `creamy` or `coffee`.
3. If you have a photo, add it to `assets/images/products/` and set `photo`. Otherwise use `photo: null`.
4. Make sure the product name and price are correct.
5. Reload the page and check both languages.

Products are displayed in collection order (the order of `GROUPS`, then the order inside `PRODUCTS`). The number shown on each card is generated automatically from that order.

### Add a collection
1. Add an entry to `GROUPS` in `script.js`, with `id`, `en` and `ar`:
   ```js
   { id: 'classic', en: 'Classics', ar: 'الكلاسيكية' },
   ```
2. Give at least one product `group: 'classic'`.
3. Reload and check the new heading in both languages.

---

## 11. Changing the WhatsApp ordering

The WhatsApp number is currently **201131072671** (country code 20, followed by the number without the leading zero). The WhatsApp link format is `https://wa.me/<number>` with **digits only, no plus sign, spaces or dashes.**

The number appears in these places. Change **all** of them if the number changes:

| Where | What |
|---|---|
| `script.js`, top | `const WHATSAPP_NUMBER = '201131072671';` (used for every product button) |
| `index.html` | Header order button, hero "Order on WhatsApp" link, closing section button, footer WhatsApp link, and the fixed mobile order bar (5 `href` values, all `https://wa.me/201131072671`) |
| `index.html`, footer | The displayed text `+20 113 107 2671` |

The text of each WhatsApp message is built in `script.js`, in the function `orderMessage`:
- English: `Hello Pharolat Chocolate! I'd like to order <NAME> (<Milk or Dark>, <price> EGP).`
- Arabic: `مرحباً فارولات شوكولاتة، أود طلب <NAME> (<ميلك or دارك>، <price> جنيه).`

Edit those sentences to change the wording. Keep the flavour name, type and price in the message, because the business uses them to process orders.

---

## 12. Environment variables, API keys and secrets

**None.** This website uses no API keys, no environment variables, no accounts and no secret values. Do not put secrets in this project: anything in a static website is public.

The optional browser test reads one environment variable, `SITE_URL`, which only tells the test where the site is running (section 8).

---

## 13. Troubleshooting

| Problem | What to check |
|---|---|
| Fonts look plain or different | The Google Fonts link needs an internet connection. Check your connection, or check the font link in `index.html` (section 7.6). |
| An image does not appear | Check the file name and folder in `assets/images/`. File names are **case-sensitive** on GitHub Pages (`Lotus-800.webp` is not `lotus-800.webp`). Check the path in `script.js` starts with `assets/…` relative to the site root. |
| Language switch does nothing | Open the browser console (F12 → Console). A JavaScript error stops the script. Look for the file and line number. |
| Arabic text is in the wrong direction | Check the `dir` attribute on `<html>` (set by `script.js`). Mixed English and Arabic in one line can flip punctuation; that is normal for bidirectional text. |
| WhatsApp button opens but the number is wrong | Check all the places listed in section 11. |
| Horizontal scrolling on a phone | Check a new long word or image. The page must not be wider than the screen. Test at 360 px. |
| GitHub Pages shows a 404 | Make sure `index.html` is in the **root** of the repository, not inside a sub-folder. |
| GitHub Pages shows the old version | Wait a few minutes after pushing, then hard-refresh the browser (Ctrl+F5 or Cmd+Shift+R). |
| Changes do not appear locally | Hard-refresh the page. Browsers cache CSS and JavaScript files. |

---

## 14. Current limitations and pending tasks

- **Four products have no photo yet:** Walnut (عين جمل), Hazelnut (بندق), Coffee (قهوة) and Dubai (دبي). They are shown as text-only cards. Photos are pending from the business.
- **Fonts are not self-hosted.** They load from Google Fonts. Self-hosting licensed WOFF2 files is pending.
- **Lighthouse has not been run.** The performance target is 90+ and the accessibility target is 95+. These are untested targets, not results.
- **Social preview and canonical URL are not set** (`og:image` and `<link rel="canonical">`), because the final public address is not yet known.
- **The almond photo is a single image without `srcset`.** It is only about 390 pixels wide, so it may look soft on high-density screens.
- **The showcase photos are unlabelled** and do not name any flavour, by design.
- **Real-device and Safari testing** has not been performed; testing so far was done in Chromium at set viewport widths.

---

## 15. Recommended future improvements

1. Add the four missing product photos, following section 7.4.
2. Self-host the fonts (Cormorant Garamond, DM Sans, Noto Naskh Arabic, Noto Sans Arabic) as WOFF2 files under `assets/fonts/`, with `@font-face` rules in `styles.css`.
3. Run Lighthouse on the live GitHub Pages address and fix anything below the targets.
4. Add `og:image`, a canonical URL and a favicon in PNG as well as SVG.
5. Use `srcset` and `sizes` on every product photo, including the almond photo.
6. Move the product list out of `script.js` into a JSON file, if the catalogue grows a lot.
7. Run the browser test automatically on each change (for example with GitHub Actions).

---

## 16. Development notes and conventions

- **Keep it simple.** Do not add a framework or build tool unless the business approves it first.
- **Keep paths relative**, and keep `.nojekyll` in the root.
- **Both languages, always.** Every visible text needs an English and an Arabic version.
- **No unverified claims.** Do not add ingredients, certifications, history, manufacturing details or testimonials without written approval.
- **One source of truth for prices and products:** `PRICES` and `PRODUCTS` in `script.js`, plus the two price text locations in section 7.3.
- **Brand name:** always "Pharolat Chocolate" / "فارولات شوكولاتة". Do not use "Pharaoh" or "Pharolet".
- **Do not change the logo** (`brand-logo.svg`) without approval.
- **Test before publishing:** check both languages, widths of 360 px and 1440 px, and the WhatsApp links.

For the architecture and safe-change rules, read `DEVELOPMENT_GUIDE.md`.
