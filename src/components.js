import { icon } from './icons.js';

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));

const money = (amount) => `৳ ${new Intl.NumberFormat('en-BD', { maximumFractionDigits: 0 }).format(Number(amount) || 0)}`;

class GbAnnouncement extends HTMLElement {
  connectedCallback() {
    const message = this.getAttribute('message') || 'Thoughtfully chosen technology';
    this.innerHTML = `<div class="announcement-bar"><span class="announcement-dot" aria-hidden="true"></span><span>${escapeHtml(message)}</span></div>`;
  }
}

class GbButton extends HTMLElement {
  connectedCallback() {
    if (this.dataset.ready) return;
    this.dataset.ready = 'true';
    const content = this.innerHTML.trim() || escapeHtml(this.getAttribute('label') || 'Action');
    const variant = this.getAttribute('variant') || 'primary';
    const size = this.getAttribute('size') || '';
    const iconName = this.getAttribute('icon');
    const href = this.getAttribute('href');
    const loading = this.hasAttribute('loading');
    const disabled = this.hasAttribute('disabled') || loading;
    const label = this.getAttribute('aria-label');
    const attrs = `${disabled ? 'disabled aria-disabled="true"' : ''} ${loading ? 'aria-busy="true"' : ''} ${label ? `aria-label="${escapeHtml(label)}"` : ''}`;
    const inner = `${content}${iconName ? icon(iconName) : ''}`;
    const classes = `button button-${escapeHtml(variant)} ${size ? `button-${escapeHtml(size)}` : ''} ${loading ? 'button-loading' : ''}`;
    this.innerHTML = href
      ? `<a class="${classes}" href="${escapeHtml(href)}" ${label ? `aria-label="${escapeHtml(label)}"` : ''}>${inner}</a>`
      : `<button class="${classes}" type="${escapeHtml(this.getAttribute('type') || 'button')}" ${attrs}>${inner}</button>`;
  }
}

class GbPrice extends HTMLElement {
  connectedCallback() {
    const amount = this.getAttribute('amount') || '0';
    const compare = this.getAttribute('compare-at');
    const large = this.hasAttribute('large') ? ' product-price-large' : '';
    this.innerHTML = `<span class="product-price${large}"><span class="currency">৳</span>${new Intl.NumberFormat('en-BD', { maximumFractionDigits: 0 }).format(Number(amount) || 0)}${compare ? `<span class="product-price-compare">${money(compare)}</span>` : ''}</span>`;
  }
}

class GbBadge extends HTMLElement {
  connectedCallback() {
    const text = this.textContent.trim() || this.getAttribute('label') || 'Status';
    const tone = this.getAttribute('tone') || 'neutral';
    this.innerHTML = `<span class="badge badge-${escapeHtml(tone)}">${escapeHtml(text)}</span>`;
  }
}

class GbProductCard extends HTMLElement {
  connectedCallback() {
    const name = this.getAttribute('name') || 'Product name';
    const category = this.getAttribute('category') || 'Gadget Bazaar';
    const price = this.getAttribute('price') || '0';
    const image = this.getAttribute('image') || '';
    const alt = this.getAttribute('alt') || name;
    const badge = this.getAttribute('badge');
    const tone = this.getAttribute('tone') || 'sage';
    const productId = this.getAttribute('product-id') || '';
    const compareAt = this.getAttribute('compare-at');
    const stock = this.getAttribute('stock') || 'in-stock';
    const stockLabel = this.getAttribute('stock-label') || (stock === 'out-of-stock' ? 'Out of stock' : 'In stock');
    const unavailable = stock === 'out-of-stock';
    this.innerHTML = `
      <article class="product-card" style="--tone: var(--tone-${escapeHtml(tone)}, #edf0eb)">
        <div class="product-card-media">
          <button class="product-card-open" type="button" data-product-open="${escapeHtml(productId)}" aria-label="View ${escapeHtml(name)} details"><img src="${escapeHtml(image)}" alt="${escapeHtml(alt)}" loading="lazy" /></button>
          ${badge ? `<div class="product-card-badges"><gb-badge tone="neutral">${escapeHtml(badge)}</gb-badge></div>` : ''}
          <div class="product-card-actions"><button class="button button-secondary add-to-cart" type="button" data-product-id="${escapeHtml(productId)}" ${unavailable ? 'disabled aria-disabled="true"' : ''}>${icon('plus')}<span>${unavailable ? 'Unavailable' : 'Add to bag'}</span></button></div>
        </div>
        <div class="product-card-info">
          <div class="product-card-copy"><span class="product-card-category">${escapeHtml(category)}</span><h3 class="product-card-title"><button type="button" data-product-open="${escapeHtml(productId)}">${escapeHtml(name)}</button></h3><div class="product-card-price"><gb-price amount="${escapeHtml(price)}" ${compareAt ? `compare-at="${escapeHtml(compareAt)}"` : ''}></gb-price></div><span class="product-stock product-stock-${escapeHtml(stock)}">${escapeHtml(stockLabel)}</span></div>
        </div>
      </article>`;
  }
}

class GbSearch extends HTMLElement {
  connectedCallback() {
    const placeholder = this.getAttribute('placeholder') || 'Search products';
    const label = this.getAttribute('label') || 'Search products';
    this.innerHTML = `<form class="search-form" role="search"><label class="sr-only">${escapeHtml(label)}</label>${icon('search')}<input type="search" placeholder="${escapeHtml(placeholder)}" aria-label="${escapeHtml(label)}" /><button class="search-submit" type="submit" aria-label="Search">${icon('arrow')}</button></form>`;
    this.querySelector('form').addEventListener('submit', (event) => {
      event.preventDefault();
      const query = this.querySelector('input').value.trim();
      document.dispatchEvent(new CustomEvent('gb:search', { detail: { query } }));
    });
    this.querySelector('input').addEventListener('input', () => document.dispatchEvent(new CustomEvent('gb:search', { detail: { query: this.querySelector('input').value.trim() } })));
  }
}

class GbField extends HTMLElement {
  connectedCallback() {
    const label = this.getAttribute('label') || 'Field label';
    const placeholder = this.getAttribute('placeholder') || '';
    const type = this.getAttribute('type') || 'text';
    const value = this.getAttribute('value') || '';
    const help = this.getAttribute('help');
    const error = this.getAttribute('error');
    const id = `gb-field-${Math.random().toString(36).slice(2, 9)}`;
    const describedBy = [help ? `${id}-help` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ');
    this.innerHTML = `<div class="field ${error ? 'field-invalid' : ''}"><label for="${id}">${escapeHtml(label)}${this.hasAttribute('required') ? ' <span aria-hidden="true">*</span>' : ''}</label><input id="${id}" type="${escapeHtml(type)}" placeholder="${escapeHtml(placeholder)}" value="${escapeHtml(value)}" ${this.hasAttribute('required') ? 'required' : ''} ${error ? 'aria-invalid="true"' : ''} ${describedBy ? `aria-describedby="${describedBy}"` : ''} />${help ? `<small class="field-helper" id="${id}-help">${escapeHtml(help)}</small>` : ''}${error ? `<small class="field-error" id="${id}-error">${escapeHtml(error)}</small>` : ''}</div>`;
  }
}

class GbDropdown extends HTMLElement {
  connectedCallback() {
    const label = this.getAttribute('label') || 'Choose an option';
    const options = (this.getAttribute('options') || 'Option one|Option two').split('|');
    const id = `gb-select-${Math.random().toString(36).slice(2, 9)}`;
    this.innerHTML = `<div class="field"><label for="${id}">${escapeHtml(label)}</label><div class="select-wrap"><select class="select-control" id="${id}">${options.map((option, index) => `<option value="${index}" ${index === 0 ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('')}</select></div></div>`;
  }
}

class GbFilter extends HTMLElement {
  connectedCallback() {
    const label = this.getAttribute('label') || 'Filter';
    const active = this.hasAttribute('active');
    this.innerHTML = `<button class="filter-chip" type="button" aria-pressed="${active}">${escapeHtml(label)}${this.hasAttribute('count') ? `<span>(${escapeHtml(this.getAttribute('count'))})</span>` : ''}</button>`;
    this.querySelector('button').addEventListener('click', (event) => {
      const button = event.currentTarget;
      button.setAttribute('aria-pressed', button.getAttribute('aria-pressed') !== 'true');
    });
  }
}

class GbGallery extends HTMLElement {
  connectedCallback() {
    const images = [
      { src: 'https://images.unsplash.com/photo-1632200004922-bc18602c79fc?auto=format&fit=crop&w=900&q=80', alt: 'Wireless earbuds on a soft studio background' },
      { src: 'https://images.unsplash.com/photo-1568650774688-1e84efe765b3?auto=format&fit=crop&w=900&q=80', alt: 'Wireless earbuds and case photographed on wood' },
      { src: 'https://images.unsplash.com/photo-1736855284620-1a03e8c74762?auto=format&fit=crop&w=900&q=80', alt: 'Earbuds arranged beside an open charging case' },
    ];
    this.innerHTML = `<div class="gallery"><div class="gallery-thumbnails" role="group" aria-label="Product images">${images.map((image, index) => `<button class="gallery-thumb" type="button" aria-label="Show product image ${index + 1}" aria-pressed="${index === 0}"><img src="${image.src}" alt="" loading="lazy" /></button>`).join('')}</div><div class="gallery-main"><img src="${images[0].src}" alt="${images[0].alt}" /></div></div>`;
    const main = this.querySelector('.gallery-main img');
    this.querySelectorAll('.gallery-thumb').forEach((button, index) => button.addEventListener('click', () => {
      this.querySelectorAll('.gallery-thumb').forEach((thumb) => thumb.setAttribute('aria-pressed', 'false'));
      button.setAttribute('aria-pressed', 'true');
      main.src = images[index].src;
      main.alt = images[index].alt;
    }));
  }
}

class GbState extends HTMLElement {
  connectedCallback() {
    const title = this.getAttribute('title') || 'Nothing here yet';
    const message = this.getAttribute('message') || 'Try again in a moment.';
    const tone = this.getAttribute('tone') || 'neutral';
    this.innerHTML = `<div class="state-card ${tone === 'error' ? 'state-error' : ''}" role="${tone === 'error' ? 'alert' : 'status'}"><span class="state-icon">${icon(this.getAttribute('icon') || 'box')}</span><h4>${escapeHtml(title)}</h4><p>${escapeHtml(message)}</p></div>`;
  }
}

class GbLoadingState extends HTMLElement {
  connectedCallback() {
    const label = this.getAttribute('label') || 'Loading';
    this.innerHTML = `<div class="loading-state" role="status" aria-label="${escapeHtml(label)}"><span class="loading-spinner" aria-hidden="true"></span><span class="loading-lines" aria-hidden="true"><span class="loading-skeleton loading-line"></span><span class="loading-skeleton loading-line"></span></span><span class="sr-only">${escapeHtml(label)}…</span></div>`;
  }
}

class GbSiteHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="site-header">
        <div class="header-inner">
          <a class="brand" href="#top" aria-label="Gadget Bazaar home"><span class="brand-mark" aria-hidden="true">gb</span><span class="brand-name"><strong>gadget bazaar</strong><small>everyday, better</small></span></a>
          <nav class="desktop-nav" aria-label="Main navigation"><a href="#shop" data-category="">Shop all</a><a href="#shop" data-category="audio">Audio</a><a href="#shop" data-category="power-and-charging">Power &amp; charging</a><a href="#shop" data-category="other-gadgets">Other gadgets</a></nav>
          <div class="header-actions"><button class="header-icon-button" type="button" data-open-search aria-label="Search products">${icon('search')}</button><button class="header-icon-button cart-action" type="button" data-open-cart aria-label="Open shopping bag">${icon('bag')}<span class="cart-count" aria-live="polite" hidden>0</span></button><button class="mobile-menu-button" type="button" aria-expanded="false" aria-label="Open navigation">${icon('menu')}</button></div>
        </div>
        <nav class="mobile-nav" data-open="false" aria-label="Mobile navigation"><a href="#shop" data-category="">Shop all</a><a href="#shop" data-category="audio">Audio</a><a href="#shop" data-category="power-and-charging">Power &amp; charging</a><a href="#shop" data-category="other-gadgets">Other gadgets</a><a href="#delivery">Delivery &amp; payment</a></nav>
      </header>`;
    const menuButton = this.querySelector('.mobile-menu-button');
    const mobileNav = this.querySelector('.mobile-nav');
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      menuButton.innerHTML = icon(open ? 'close' : 'menu');
      mobileNav.dataset.open = String(open);
    });
    mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
      menuButton.innerHTML = icon('menu');
      mobileNav.dataset.open = 'false';
    }));
    this.querySelector('[data-open-cart]').addEventListener('click', () => document.dispatchEvent(new CustomEvent('gb:cart-open')));
    this.querySelector('[data-open-search]').addEventListener('click', () => document.dispatchEvent(new CustomEvent('gb:search-open')));
  }
}

class GbCartDrawer extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<dialog class="cart-dialog" aria-labelledby="cart-title"><div class="cart-panel"><div class="cart-header"><h2 id="cart-title">Your bag <span class="cart-title-count"></span></h2><button class="icon-close" type="button" aria-label="Close bag">${icon('close')}</button></div><div class="cart-content"></div><div class="cart-footer"></div></div></dialog>`;
    this.dialog = this.querySelector('dialog');
    this.dialog.addEventListener('click', (event) => { if (event.target === this.dialog) this.dialog.close(); });
    this.querySelector('.icon-close').addEventListener('click', () => this.dialog.close());
    this.addEventListener('click', (event) => {
      const quantityButton = event.target.closest('[data-quantity]');
      if (quantityButton) {
        const current = Number(quantityButton.dataset.currentQuantity);
        const change = quantityButton.dataset.quantity === 'plus' ? 1 : -1;
        document.dispatchEvent(new CustomEvent('gb:cart-set-quantity', { detail: { productId: quantityButton.dataset.productId, quantity: current + change } }));
      }
    });
    document.addEventListener('gb:cart-open', () => this.open());
    document.addEventListener('gb:cart-change', (event) => this.render(event.detail?.lines || []));
    this.render();
  }
  open() { this.dialog.showModal(); }
  render(lines = []) {
    const count = lines.reduce((sum, line) => sum + line.quantity, 0);
    const subtotal = lines.reduce((sum, line) => sum + (Number(line.product.price) * line.quantity), 0);
    this.querySelector('.cart-title-count').textContent = count ? `(${count})` : '';
    document.querySelectorAll('.cart-count').forEach((node) => { node.textContent = count; node.hidden = count === 0; });
    const content = this.querySelector('.cart-content');
    const footer = this.querySelector('.cart-footer');
    if (!lines.length) {
      content.innerHTML = `<div class="cart-empty"><span class="state-icon">${icon('bag')}</span><h3>Your bag is taking a breather.</h3><p>When something catches your eye, it’ll be right here.</p><button class="button button-secondary" type="button" data-close-cart>Explore the edit</button></div>`;
      footer.innerHTML = '';
      content.querySelector('[data-close-cart]').addEventListener('click', () => { this.dialog.close(); document.querySelector('#shop')?.scrollIntoView({ behavior: 'smooth' }); });
      return;
    }
    content.innerHTML = lines.map(({ product, quantity }) => `
      <div class="cart-line"><img class="cart-line-image" src="${escapeHtml(product.image)}" alt="" />
        <div><h3 class="cart-line-name">${escapeHtml(product.name)}</h3><span class="cart-line-meta">${money(product.price)} each</span>
          <div class="quantity-control"><button type="button" data-quantity="minus" data-product-id="${escapeHtml(product.id)}" data-current-quantity="${quantity}" aria-label="Remove one ${escapeHtml(product.name)}">−</button><span>${quantity}</span><button type="button" data-quantity="plus" data-product-id="${escapeHtml(product.id)}" data-current-quantity="${quantity}" aria-label="Add one ${escapeHtml(product.name)}">+</button></div>
        </div><strong class="cart-line-price">${money(Number(product.price) * quantity)}</strong></div>`).join('');
    footer.innerHTML = `<div class="cart-subtotal"><span>Subtotal</span><span>${money(subtotal)}</span></div><p class="cart-delivery-note">Cash on delivery is planned. Online ordering is not available yet.</p><button class="button button-primary" type="button" disabled aria-disabled="true">Checkout coming soon</button>`;
  }
}

class GbDialog extends HTMLElement {
  connectedCallback() {
    const title = this.getAttribute('title') || 'Information';
    const content = this.innerHTML;
    this.innerHTML = `<dialog class="standard-dialog" aria-labelledby="${escapeHtml(this.id)}-title"><div class="dialog-header"><h2 id="${escapeHtml(this.id)}-title">${escapeHtml(title)}</h2><button class="icon-close" type="button" aria-label="Close dialog">${icon('close')}</button></div>${content}</dialog>`;
    this.dialog = this.querySelector('dialog');
    this.querySelector('.icon-close').addEventListener('click', () => this.dialog.close());
    this.dialog.addEventListener('click', (event) => { if (event.target === this.dialog) this.dialog.close(); });
  }
  open() { this.dialog?.showModal(); }
}

class GbToast extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<div class="toast-region" aria-live="polite" aria-atomic="false"></div>';
    this.region = this.querySelector('.toast-region');
    document.addEventListener('gb:toast', (event) => this.show(event.detail?.message || 'Done.'));
  }
  show(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.innerHTML = `<span class="toast-mark">${icon('check')}</span><span>${escapeHtml(message)}</span>`;
    this.region.append(toast);
    window.setTimeout(() => toast.remove(), 3600);
  }
}

class GbSiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="site-footer" id="footer"><div class="footer-inner"><div class="footer-top">
        <div class="footer-brand"><a class="brand" href="#top" aria-label="Gadget Bazaar home"><span class="brand-mark" aria-hidden="true">gb</span><span class="brand-name"><strong>gadget bazaar</strong><small>everyday, better</small></span></a><p class="footer-brand-copy">A thoughtful edit of useful technology, made for the everyday.</p></div>
        <div class="footer-column"><h3>Explore</h3><a href="#shop" data-category="">Shop all</a><a href="#shop" data-category="audio">Audio</a><a href="#shop" data-category="power-and-charging">Power &amp; charging</a><a href="#shop" data-category="other-gadgets">Other gadgets</a></div>
        <div class="footer-column"><h3>Delivery &amp; payment</h3><a href="#delivery">Delivery information</a><a href="#payment">Cash on delivery</a><span class="footer-note">Online payment options are being prepared.</span></div>
        <div class="footer-column"><h3>Support</h3><span class="footer-note">Support contact details coming soon.</span><a href="#top">Back to top <span aria-hidden="true">↑</span></a></div>
      </div><div class="footer-bottom"><span>© 2026 Gadget Bazaar. Sample storefront.</span><div class="footer-payment"><span>COD planned</span><span>Prices in BDT</span></div></div></div></footer>`;
  }
}

customElements.define('gb-announcement', GbAnnouncement);
customElements.define('gb-button', GbButton);
customElements.define('gb-price', GbPrice);
customElements.define('gb-badge', GbBadge);
customElements.define('gb-product-card', GbProductCard);
customElements.define('gb-search', GbSearch);
customElements.define('gb-field', GbField);
customElements.define('gb-dropdown', GbDropdown);
customElements.define('gb-filter', GbFilter);
customElements.define('gb-gallery', GbGallery);
customElements.define('gb-state', GbState);
customElements.define('gb-loading-state', GbLoadingState);
customElements.define('gb-site-header', GbSiteHeader);
customElements.define('gb-cart-drawer', GbCartDrawer);
customElements.define('gb-dialog', GbDialog);
customElements.define('gb-toast', GbToast);
customElements.define('gb-site-footer', GbSiteFooter);
