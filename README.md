# Gadget Bazaar storefront foundation

Gadget Bazaar is a small, browser-native storefront prototype built with **HTML, CSS custom properties, and JavaScript Web Components**. It intentionally has no package or build dependency.

## Preview

Run `node scripts/preview.mjs` and open `http://127.0.0.1:4173`. ES modules and custom elements require an HTTP origin in most browsers. The preview server uses only Node's built-in modules.

## Structure

- `index.html` — responsive Gadget Bazaar homepage and dialogs
- `src/data/products.js` — centralized sample catalog and categories
- `src/styles/tokens.css` — color, type, spacing, radius, sizing, and motion tokens
- `src/styles/base.css` — reset, accessibility, and global behavior
- `src/styles/components.css` — shared component and dialog styles
- `src/styles/layout.css` — responsive storefront layout and grids
- `src/components.js` — reusable Web Components, header, bag and footer
- `src/icons.js` — inline SVG icon set
- `src/main.js` — catalog search, category/price/stock filters, price/newest sorting, product URL routes, and cart state

The catalog, prices, stock labels, descriptions, and product images are sample content. Photography is hosted by Unsplash; replace it with approved product photography and verified catalog information before production. Cart state is stored locally in the current browser. Checkout, order processing, customer accounts, backend inventory, delivery rates, and payment providers are not connected.

## Deploy to Vercel

This project is a static HTML, CSS, and JavaScript site with no build or install step. When importing the GitHub repository into Vercel, use the `Other` framework preset, leave the build and install commands blank, and set the output directory to `.` so Vercel serves the root `index.html` and its `/src` assets. Connect the production branch to enable deployments when changes are pushed.

Before accepting real orders, replace the sample catalog and confirm delivery, support, warranty, and return information. Keep credentials and private settings out of Git; `.gitignore` excludes Vercel metadata and `.env` files.
