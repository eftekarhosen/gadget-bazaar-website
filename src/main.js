import './components.js';
import { categories, featuredProductId, products } from './data/products.js';
import { icon } from './icons.js';

const byId = new Map(products.map((product) => [product.id, product]));
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));
const money = (amount) => `৳ ${new Intl.NumberFormat('en-BD', { maximumFractionDigits: 0 }).format(Number(amount) || 0)}`;
const categoryTitle = (id) => ({ audio: 'Audio', 'power-and-charging': 'Power & charging' })[id]
  || categories.find((category) => category.id === id)?.title || 'Shop all';
const priceLabel = (range) => ({
  'under-1000': 'Under ৳1,000',
  '1000-2999': '৳1,000–৳2,999',
  '3000-4999': '৳3,000–৳4,999',
  '5000-plus': '৳5,000 and above',
}[range] || '');

let selectedCategory = '';
let searchQuery = '';
let inStockOnly = false;
let priceRange = 'all';
let sortBy = 'featured';

const loadCart = () => {
  try {
    const stored = JSON.parse(localStorage.getItem('gb-cart') || '[]');
    return new Map(stored
      .filter((line) => byId.has(line.productId) && Number.isInteger(line.quantity) && line.quantity > 0)
      .map((line) => [line.productId, line.quantity]));
  } catch {
    return new Map();
  }
};
const cart = loadCart();

function saveAndRenderCart() {
  const lines = [...cart.entries()].map(([productId, quantity]) => ({ product: byId.get(productId), quantity }));
  try { localStorage.setItem('gb-cart', JSON.stringify([...cart].map(([productId, quantity]) => ({ productId, quantity })))); } catch { /* Cart still works in memory if browser storage is unavailable. */ }
  document.dispatchEvent(new CustomEvent('gb:cart-change', { detail: { lines } }));
}

function renderCategories() {
  const target = document.querySelector('#category-grid');
  target.innerHTML = categories.map((category) => {
    const product = byId.get(category.imageProductId);
    const count = products.filter((item) => item.categoryId === category.id).length;
    return `<a class="category-card" href="#shop" data-category="${escapeHtml(category.id)}" style="--tone:var(--tone-${escapeHtml(category.tone)})">
      <div class="category-card-image"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.alt)}" loading="lazy" /><span class="category-card-count">${count} essentials</span></div>
      <div class="category-card-copy"><div><h3>${escapeHtml(category.title)}</h3><p>${escapeHtml(category.description)}</p></div><span class="category-arrow" aria-hidden="true">↗</span></div>
    </a>`;
  }).join('');
}

function renderProductCard(product) {
  return `<gb-product-card product-id="${escapeHtml(product.id)}" name="${escapeHtml(product.name)}" category="${escapeHtml(product.category)}" price="${product.price}" ${product.compareAt ? `compare-at="${product.compareAt}"` : ''} image="${escapeHtml(product.image)}" alt="${escapeHtml(product.alt)}" badge="${escapeHtml(product.badge)}" tone="${escapeHtml(product.tone)}" stock="${escapeHtml(product.stock)}" stock-label="${escapeHtml(product.stockLabel)}"></gb-product-card>`;
}

function isWithinPriceRange(price) {
  if (priceRange === 'under-1000') return price < 1000;
  if (priceRange === '1000-2999') return price >= 1000 && price < 3000;
  if (priceRange === '3000-4999') return price >= 3000 && price < 5000;
  if (priceRange === '5000-plus') return price >= 5000;
  return true;
}

function visibleProducts() {
  let result = products.filter((product) => {
    if (selectedCategory && product.navCategory !== selectedCategory && product.categoryId !== selectedCategory) return false;
    if (inStockOnly && product.stock === 'out-of-stock') return false;
    if (!isWithinPriceRange(product.price)) return false;
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });
  if (sortBy === 'newest') result = [...result].sort((a, b) => b.addedAt.localeCompare(a.addedAt));
  if (sortBy === 'price-low') result = [...result].sort((a, b) => a.price - b.price);
  if (sortBy === 'price-high') result = [...result].sort((a, b) => b.price - a.price);
  if (sortBy === 'name') result = [...result].sort((a, b) => a.name.localeCompare(b.name));
  return result;
}

function renderShop() {
  const productGrid = document.querySelector('#product-grid');
  const emptyState = document.querySelector('#shop-empty');
  const errorState = document.querySelector('#shop-error');
  try {
    const items = visibleProducts();
    const categoryLabel = selectedCategory ? categoryTitle(selectedCategory) : '';
    const heading = document.querySelector('#shop-title');
    heading.innerHTML = categoryLabel ? `${escapeHtml(categoryLabel)} <span>essentials.</span>` : 'Good things, <span>well chosen.</span>';
    document.querySelector('#shop-result-count').textContent = `${items.length} ${items.length === 1 ? 'item' : 'items'}${searchQuery ? ` matching “${searchQuery}”` : ''}`;
    const activeParts = [categoryLabel, priceLabel(priceRange), inStockOnly ? 'In stock' : '', searchQuery ? `Name: “${searchQuery}”` : ''].filter(Boolean);
    document.querySelector('#active-filter-row').hidden = activeParts.length === 0;
    document.querySelector('#active-filter-label').textContent = activeParts.join(' · ');
    productGrid.innerHTML = items.map(renderProductCard).join('');
    productGrid.hidden = items.length === 0;
    emptyState.hidden = items.length !== 0;
    errorState.hidden = true;
  } catch (error) {
    console.error('Could not render the product collection.', error);
    productGrid.hidden = true;
    emptyState.hidden = true;
    errorState.hidden = false;
    document.querySelector('#shop-result-count').textContent = 'Collection unavailable';
  }
}

function renderEditorial() {
  const product = byId.get(featuredProductId);
  document.querySelector('#editorial-content').innerHTML = `
    <div class="editorial-visual"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.alt)}" loading="lazy" /><span class="editorial-index">THE EVERYDAY EDIT <span>01 / 04</span></span></div>
    <div class="editorial-copy"><p class="eyebrow">A closer look · ${escapeHtml(product.category)}</p><h2 id="editorial-title">A little more <span>listening.</span></h2><p class="editorial-description">${escapeHtml(product.description)}</p>
      <ul class="feature-list">${product.features.map((feature) => `<li><span aria-hidden="true">${icon('check')}</span>${escapeHtml(feature)}</li>`).join('')}</ul>
      <div class="editorial-price-row"><gb-price amount="${product.price}" ${product.compareAt ? `compare-at="${product.compareAt}"` : ''} large></gb-price><span class="product-stock product-stock-${escapeHtml(product.stock)}">${escapeHtml(product.stockLabel)}</span></div>
      <button class="button button-primary" type="button" data-product-open="${escapeHtml(product.id)}">Discover the details ${icon('arrow')}</button>
    </div>`;
}

function renderSearchResults(query = '') {
  const normalized = query.trim().toLowerCase();
  const results = (normalized
    ? products.filter((product) => product.name.toLowerCase().includes(normalized))
    : products.filter((product) => product.featured)).slice(0, 6);
  document.querySelector('#search-results-label').textContent = normalized ? `${results.length} ${results.length === 1 ? 'result' : 'results'} for “${query.trim()}”` : 'Popular in the edit';
  document.querySelector('#search-results').innerHTML = results.length ? results.map((product) => `
    <button type="button" class="search-result" data-product-open="${escapeHtml(product.id)}"><img src="${escapeHtml(product.image)}" alt="" loading="lazy" /><span><strong>${escapeHtml(product.name)}</strong><small>${escapeHtml(categoryTitle(product.categoryId))}</small></span><span class="search-result-price">${money(product.price)}</span>${icon('arrow')}</button>`).join('')
    : '<p class="search-no-results">No product names match yet. Try “earbuds”, “power bank” or “USB-C”.</p>';
}

function productFromRoute() {
  const match = location.hash.match(/^#product\/([^?]+)/);
  if (!match) return undefined;
  let slug = match[1];
  try { slug = decodeURIComponent(slug); } catch { /* Keep the raw slug if the URL is malformed. */ }
  return products.find((product) => product.slug === slug);
}

function openProduct(productId, { navigate = true } = {}) {
  const product = byId.get(productId);
  if (!product) return;
  const dialog = document.querySelector('#product-dialog');
  if (navigate && !location.hash.startsWith('#product/')) {
    history.pushState({ gbProductId: product.id, gbReturnHash: location.hash || '#shop' }, '', `#product/${encodeURIComponent(product.slug)}`);
  }
  dialog.dataset.productId = product.id;
  document.querySelector('#product-detail-content').innerHTML = `
    <div class="product-detail-grid"><div class="product-detail-image" style="--tone:var(--tone-${escapeHtml(product.tone)})"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.alt)}" /></div>
      <div class="product-detail-copy"><span class="product-card-category">${escapeHtml(categoryTitle(product.categoryId))}</span>${product.badge ? `<gb-badge>${escapeHtml(product.badge)}</gb-badge>` : ''}<h2 id="product-detail-title">${escapeHtml(product.name)}</h2><gb-price amount="${product.price}" ${product.compareAt ? `compare-at="${product.compareAt}"` : ''} large></gb-price><span class="product-stock product-stock-${escapeHtml(product.stock)}">${escapeHtml(product.stockLabel)}</span><p>${escapeHtml(product.description)}</p><h3>Details</h3><ul class="feature-list">${product.features.map((feature) => `<li><span aria-hidden="true">${icon('check')}</span>${escapeHtml(feature)}</li>`).join('')}</ul><button class="button button-primary detail-add-button" type="button" data-product-id="${escapeHtml(product.id)}" ${product.stock === 'out-of-stock' ? 'disabled aria-disabled="true"' : ''}>${product.stock === 'out-of-stock' ? 'Currently unavailable' : `Add to bag · ${money(product.price)}`}${product.stock === 'out-of-stock' ? '' : icon('plus')}</button><p class="detail-note">Sample catalog information. Product specifications and availability will be confirmed before launch.</p></div></div>`;
  if (!dialog.open) dialog.showModal();
  document.title = `${product.name} — Gadget Bazaar`;
}

function categoryFromHash(hash = location.hash) {
  if (!hash.includes('?')) return '';
  const category = new URLSearchParams(hash.split('?')[1]).get('category') || '';
  return categories.some((item) => item.id === category) || ['audio', 'power-and-charging'].includes(category) ? category : '';
}

function setCategory(categoryId) {
  selectedCategory = categoryId || '';
  history.replaceState(null, '', selectedCategory ? `#shop?category=${encodeURIComponent(selectedCategory)}` : '#shop');
  renderShop();
  document.querySelector('#shop').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeProductRoute() {
  const dialog = document.querySelector('#product-dialog');
  if (!dialog.open) return;
  const state = history.state;
  if (location.hash.startsWith('#product/') && state?.gbProductId === dialog.dataset.productId) {
    history.back();
    return;
  }
  history.replaceState(null, '', '#shop');
  syncRouteFromLocation();
}

function syncRouteFromLocation() {
  if (location.hash.startsWith('#product/')) {
    const product = productFromRoute();
    if (product) {
      if (!document.querySelector('#product-dialog').open || document.querySelector('#product-dialog').dataset.productId !== product.id) openProduct(product.id, { navigate: false });
      return;
    }
    history.replaceState(null, '', '#shop');
  }
  if (document.querySelector('#product-dialog').open) document.querySelector('#product-dialog').close();
  selectedCategory = categoryFromHash();
  renderShop();
  document.title = 'Gadget Bazaar — Everyday tech, considered.';
}

function addToCart(productId) {
  const product = byId.get(productId);
  if (!product || product.stock === 'out-of-stock') return;
  cart.set(productId, (cart.get(productId) || 0) + 1);
  saveAndRenderCart();
  document.dispatchEvent(new CustomEvent('gb:toast', { detail: { message: `${product.name} added to your bag.`, tone: 'success' } }));
}

document.addEventListener('click', (event) => {
  const addButton = event.target.closest('.add-to-cart, .detail-add-button');
  if (addButton && !addButton.disabled) {
    addToCart(addButton.dataset.productId);
    return;
  }

  const categoryLink = event.target.closest('[data-category]');
  if (categoryLink) {
    event.preventDefault();
    setCategory(categoryLink.dataset.category);
    return;
  }

  const productLink = event.target.closest('[data-product-open]');
  if (productLink) {
    document.querySelector('#search-dialog')?.close();
    openProduct(productLink.dataset.productOpen);
    return;
  }

  if (event.target.closest('[data-close-dialog]')) {
    const dialog = event.target.closest('dialog');
    if (dialog?.id === 'product-dialog') closeProductRoute();
    else dialog?.close();
  }

  if (event.target.closest('#clear-filter, #reset-shop')) {
    searchQuery = '';
    inStockOnly = false;
    priceRange = 'all';
    const searchInput = document.querySelector('#search-dialog gb-search input');
    if (searchInput) searchInput.value = '';
    document.querySelector('#in-stock-filter').checked = false;
    document.querySelector('#price-filter').value = 'all';
    setCategory('');
    renderSearchResults('');
  }

  if (event.target.closest('#retry-shop')) renderShop();
});

document.addEventListener('gb:cart-set-quantity', (event) => {
  const { productId, quantity } = event.detail || {};
  if (!byId.has(productId)) return;
  if (quantity > 0) cart.set(productId, quantity);
  else cart.delete(productId);
  saveAndRenderCart();
});

document.addEventListener('gb:search', (event) => {
  searchQuery = event.detail?.query || '';
  renderSearchResults(searchQuery);
  renderShop();
});

document.addEventListener('gb:search-open', () => {
  const dialog = document.querySelector('#search-dialog');
  searchQuery = dialog.querySelector('input')?.value.trim() || '';
  renderSearchResults(searchQuery);
  renderShop();
  if (!dialog.open) dialog.showModal();
  window.setTimeout(() => dialog.querySelector('input')?.focus(), 0);
});

document.querySelector('#product-dialog').addEventListener('cancel', (event) => {
  event.preventDefault();
  closeProductRoute();
});
document.querySelector('#product-dialog').addEventListener('click', (event) => {
  if (event.target === event.currentTarget) closeProductRoute();
});
document.querySelector('#sort-products').addEventListener('change', (event) => {
  sortBy = event.target.value;
  renderShop();
});
document.querySelector('#price-filter').addEventListener('change', (event) => {
  priceRange = event.target.value;
  renderShop();
});
document.querySelector('#in-stock-filter').addEventListener('change', (event) => {
  inStockOnly = event.target.checked;
  renderShop();
});

renderCategories();
renderShop();
renderEditorial();
renderSearchResults('');
saveAndRenderCart();
syncRouteFromLocation();
window.addEventListener('popstate', syncRouteFromLocation);
window.addEventListener('hashchange', syncRouteFromLocation);
