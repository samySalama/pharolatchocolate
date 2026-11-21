(function () {
  'use strict';

  const CONFIG = window.PHAROLAT_CONFIG;
  if (!CONFIG || !Array.isArray(CONFIG.products)) return;

  const STORAGE_KEY = 'pharolat-cart-v2';
  const productById = new Map(CONFIG.products.map((product) => [product.id, product]));
  const selectedVariants = Object.fromEntries(CONFIG.products.map((product) => [product.id, 'milk']));
  const selectedQuantities = Object.fromEntries(CONFIG.products.map((product) => [product.id, 1]));

  let cart = loadCart();
  let checkoutVisible = false;
  let lastFocusBeforeDrawer = null;
  let toastTimer = null;
  let drawerTransitionTimer = null;

  const elements = {
    grid: document.getElementById('products-grid'),
    search: document.getElementById('product-search'),
    sort: document.getElementById('sort-products'),
    visibleCount: document.getElementById('visible-count'),
    emptySearch: document.getElementById('empty-search'),
    clearSearch: document.getElementById('clear-search'),
    cartCount: document.getElementById('header-cart-count'),
    mobileCount: document.getElementById('mobile-cart-count'),
    mobileTotal: document.getElementById('mobile-cart-total'),
    mobileBar: document.querySelector('.mobile-cart-bar'),
    drawer: document.getElementById('cart-drawer'),
    backdrop: document.getElementById('drawer-backdrop'),
    cartItems: document.getElementById('cart-items'),
    cartEmpty: document.getElementById('cart-empty'),
    drawerSubtotal: document.getElementById('drawer-subtotal'),
    checkoutButton: document.getElementById('checkout-button'),
    checkoutSection: document.getElementById('checkout-section'),
    checkoutForm: document.getElementById('checkout-form'),
    formError: document.getElementById('form-error'),
    modal: document.getElementById('image-modal'),
    modalImage: document.getElementById('modal-image'),
    toast: document.getElementById('toast'),
    menu: document.getElementById('main-nav'),
    menuToggle: document.getElementById('menu-toggle')
  };

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
  }

  function money(value) {
    return `${new Intl.NumberFormat('en-EG').format(value)} ${CONFIG.currency}`;
  }

  function variantName(variant) {
    return variant === 'dark' ? 'دارك' : 'ميلك';
  }

  function getProductPrice(product, variant) {
    return variant === 'dark' ? product.dark : product.milk;
  }

  function getCartCount() {
    return cart.reduce((total, line) => total + line.quantity, 0);
  }

  function getSubtotal() {
    return cart.reduce((total, line) => total + line.unitPrice * line.quantity, 0);
  }

  function loadCart() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (!Array.isArray(saved)) return [];
      return saved.map((line) => {
        const product = productById.get(line.id);
        const variant = line.variant === 'dark' ? 'dark' : 'milk';
        const quantity = Math.max(1, Math.min(99, Number.parseInt(line.quantity, 10) || 1));
        if (!product) return null;
        return {
          id: product.id,
          variant,
          quantity,
          unitPrice: getProductPrice(product, variant)
        };
      }).filter(Boolean);
    } catch (error) {
      return [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      // The shop remains usable when local storage is unavailable.
    }
  }

  function productCard(product) {
    const variant = selectedVariants[product.id];
    const price = getProductPrice(product, variant);
    const quantity = selectedQuantities[product.id];
    return `
      <article class="product-card" data-product-id="${escapeHTML(product.id)}">
        <span class="product-index">${product.number}</span>
        <button class="product-photo-button" type="button" data-action="zoom" aria-label="تكبير صورة ${escapeHTML(product.name)}">
          <img src="${escapeHTML(product.image)}" alt="شوكولاتة ${escapeHTML(product.name)} من Pharolat" loading="lazy">
        </button>
        <div class="product-card-body">
          <div class="product-title-row"><h3 class="product-title">${escapeHTML(product.name)}</h3></div>
          <p class="product-subtitle" dir="ltr">${escapeHTML(product.english)}</p>
          <div class="variant-switch" role="group" aria-label="اختار نوع ${escapeHTML(product.name)}">
            <button class="variant-button ${variant === 'milk' ? 'is-active' : ''}" type="button" data-action="variant" data-variant="milk" aria-pressed="${variant === 'milk'}">ميلك</button>
            <button class="variant-button ${variant === 'dark' ? 'is-active' : ''}" type="button" data-action="variant" data-variant="dark" aria-pressed="${variant === 'dark'}">دارك</button>
          </div>
          <div class="product-buy-row">
            <div class="product-price"><strong>${money(price)}</strong><small>للقطعة</small></div>
            <div class="product-actions">
              <div class="quantity-control" aria-label="الكمية">
                <button type="button" data-action="quantity" data-step="-1" aria-label="تقليل الكمية">−</button>
                <span>${quantity}</span>
                <button type="button" data-action="quantity" data-step="1" aria-label="زيادة الكمية">+</button>
              </div>
              <button class="add-button" type="button" data-action="add"><span aria-hidden="true">＋</span> ضيف للسلة</button>
            </div>
          </div>
        </div>
      </article>`;
  }

  function getVisibleProducts() {
    const query = (elements.search.value || '').trim().toLocaleLowerCase('ar');
    let products = CONFIG.products.filter((product) => {
      if (!query) return true;
      return product.name.toLocaleLowerCase('ar').includes(query)
        || product.english.toLowerCase().includes(query)
        || String(product.number).includes(query);
    });

    switch (elements.sort.value) {
      case 'low':
        products.sort((a, b) => getProductPrice(a, selectedVariants[a.id]) - getProductPrice(b, selectedVariants[b.id]));
        break;
      case 'high':
        products.sort((a, b) => getProductPrice(b, selectedVariants[b.id]) - getProductPrice(a, selectedVariants[a.id]));
        break;
      case 'az':
        products.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
        break;
      default:
        products.sort((a, b) => a.number - b.number);
    }
    return products;
  }

  function renderProducts() {
    const products = getVisibleProducts();
    elements.grid.innerHTML = products.map(productCard).join('');
    elements.visibleCount.textContent = String(products.length).padStart(2, '0');
    elements.emptySearch.hidden = products.length !== 0;
    elements.grid.hidden = products.length === 0;
  }

  function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => elements.toast.classList.remove('is-visible'), 2100);
  }

  function addToCart(product) {
    const variant = selectedVariants[product.id];
    const quantity = selectedQuantities[product.id];
    const existing = cart.find((line) => line.id === product.id && line.variant === variant);
    if (existing) existing.quantity = Math.min(99, existing.quantity + quantity);
    else cart.push({ id: product.id, variant, quantity, unitPrice: getProductPrice(product, variant) });

    selectedQuantities[product.id] = 1;
    saveCart();
    renderProducts();
    renderCart();
    showToast(`اتضاف ${product.name} (${variantName(variant)}) لسلتك`);
  }

  function cartLineTemplate(line) {
    const product = productById.get(line.id);
    if (!product) return '';
    return `
      <article class="cart-line" data-cart-id="${escapeHTML(line.id)}" data-cart-variant="${line.variant}">
        <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" loading="lazy">
        <div class="cart-line-info">
          <strong>${escapeHTML(product.name)}</strong>
          <small>${variantName(line.variant)} · ${money(line.unitPrice)} للقطعة</small>
          <div class="cart-line-bottom">
            <div class="quantity-control" aria-label="تعديل الكمية">
              <button type="button" data-cart-action="quantity" data-step="-1" aria-label="تقليل الكمية">−</button>
              <span>${line.quantity}</span>
              <button type="button" data-cart-action="quantity" data-step="1" aria-label="زيادة الكمية">+</button>
            </div>
            <button class="remove-line" type="button" data-cart-action="remove">حذف</button>
          </div>
        </div>
        <strong class="cart-line-total">${money(line.unitPrice * line.quantity)}</strong>
      </article>`;
  }

  function renderCart() {
    const count = getCartCount();
    const subtotal = getSubtotal();
    elements.cartCount.textContent = count;
    elements.mobileCount.textContent = count;
    elements.mobileTotal.textContent = money(subtotal);
    elements.mobileBar.classList.toggle('is-visible', count > 0);
    elements.drawerSubtotal.textContent = money(subtotal);
    elements.cartItems.innerHTML = cart.map(cartLineTemplate).join('');
    elements.cartEmpty.hidden = cart.length > 0;
    elements.cartItems.hidden = cart.length === 0;
    elements.checkoutButton.disabled = cart.length === 0;
    if (cart.length === 0) checkoutVisible = false;
    elements.checkoutButton.querySelector('[data-checkout-label]').textContent = checkoutVisible ? 'إخفاء بيانات الطلب' : 'استكمال بيانات الطلب';
    elements.checkoutButton.querySelector('[data-checkout-arrow]').textContent = checkoutVisible ? '↑' : '←';
    elements.checkoutButton.setAttribute('aria-expanded', String(checkoutVisible));
    elements.checkoutSection.hidden = cart.length === 0 || !checkoutVisible;
    if (cart.length === 0) checkoutVisible = false;
  }

  function openDrawer() {
    lastFocusBeforeDrawer = document.activeElement;
    window.clearTimeout(drawerTransitionTimer);
    elements.backdrop.hidden = false;
    requestAnimationFrame(() => {
      elements.backdrop.classList.add('is-visible');
      elements.drawer.classList.add('is-open');
      elements.drawer.setAttribute('aria-hidden', 'false');
      document.body.classList.add('drawer-open');
      const closeButton = elements.drawer.querySelector('[data-close-cart]');
      if (closeButton) closeButton.focus();
    });
  }

  function closeDrawer() {
    elements.drawer.classList.remove('is-open');
    elements.drawer.setAttribute('aria-hidden', 'true');
    elements.backdrop.classList.remove('is-visible');
    document.body.classList.remove('drawer-open');
    drawerTransitionTimer = window.setTimeout(() => { elements.backdrop.hidden = true; }, 300);
    if (lastFocusBeforeDrawer && typeof lastFocusBeforeDrawer.focus === 'function') {
      lastFocusBeforeDrawer.focus({ preventScroll: true });
    }
  }

  function openImage(src, alt) {
    elements.modalImage.src = src;
    elements.modalImage.alt = alt || 'صورة من Pharolat Chocolate';
    if (typeof elements.modal.showModal === 'function') {
      elements.modal.showModal();
      document.body.classList.add('modal-open');
    } else {
      window.open(src, '_blank', 'noopener');
    }
  }

  function closeImage() {
    if (elements.modal.open) elements.modal.close();
    document.body.classList.remove('modal-open');
  }

  function setCheckoutVisibility() {
    if (cart.length === 0) return;
    checkoutVisible = !checkoutVisible;
    renderCart();
    if (checkoutVisible) {
      window.setTimeout(() => elements.checkoutSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
      document.getElementById('customer-name').focus({ preventScroll: true });
    } else {
      elements.cartItems.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function markInvalid(input, invalid) {
    input.setAttribute('aria-invalid', invalid ? 'true' : 'false');
  }

  function validateCheckout() {
    const fields = [
      { input: document.getElementById('customer-name'), message: 'اكتب الاسم بالكامل.' },
      { input: document.getElementById('customer-phone'), message: 'اكتب رقم موبايل صحيح.' },
      { input: document.getElementById('customer-area'), message: 'اكتب المنطقة أو الحي.' },
      { input: document.getElementById('customer-address'), message: 'اكتب العنوان بالتفصيل.' }
    ];
    let firstInvalid = null;
    let errorMessage = '';

    fields.forEach(({ input, message }) => {
      let invalid = input.value.trim().length === 0;
      if (input.id === 'customer-phone') {
        const digits = input.value.replace(/\D/g, '');
        invalid = digits.length < 10 || digits.length > 13;
      }
      if (input.id === 'customer-name') invalid = input.value.trim().length < 3;
      if (input.id === 'customer-area') invalid = input.value.trim().length < 2;
      if (input.id === 'customer-address') invalid = input.value.trim().length < 5;
      markInvalid(input, invalid);
      if (invalid && !firstInvalid) {
        firstInvalid = input;
        errorMessage = message;
      }
    });

    if (firstInvalid) {
      elements.formError.textContent = errorMessage;
      elements.formError.hidden = false;
      firstInvalid.focus();
      return false;
    }
    elements.formError.hidden = true;
    return true;
  }

  function buildWhatsAppMessage(formData) {
    const orderLines = cart.map((line) => {
      const product = productById.get(line.id);
      return `- ${product.name} (${variantName(line.variant)}) × ${line.quantity} = ${money(line.unitPrice * line.quantity)}`;
    });
    const notes = String(formData.get('orderNotes') || '').trim();
    return [
      `طلب جديد من ${CONFIG.brandName}`,
      '',
      'تفاصيل الطلب:',
      ...orderLines,
      '',
      `إجمالي المنتجات: ${money(getSubtotal())}`,
      'التوصيل: يُحدد حسب المنطقة بالاتفاق على واتساب',
      '',
      'بيانات العميل:',
      `الاسم: ${String(formData.get('customerName')).trim()}`,
      `رقم الموبايل: ${String(formData.get('customerPhone')).trim()}`,
      `المنطقة: ${String(formData.get('customerArea')).trim()}`,
      `العنوان: ${String(formData.get('customerAddress')).trim()}`,
      ...(notes ? [`ملاحظات: ${notes}`] : []),
      '',
      'برجاء تأكيد توافر المنتجات وتكلفة التوصيل.'
    ].join('\n');
  }

  function handleCheckoutSubmit(event) {
    event.preventDefault();
    if (cart.length === 0 || !validateCheckout()) return;
    const formData = new FormData(elements.checkoutForm);
    const message = buildWhatsAppMessage(formData);
    const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
    // Same-tab navigation avoids popup blocking in mobile and in-app browsers.
    window.location.assign(url);
  }

  // Product grid actions.
  elements.grid.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const card = button.closest('[data-product-id]');
    if (!card) return;
    const product = productById.get(card.dataset.productId);
    if (!product) return;

    const action = button.dataset.action;
    if (action === 'zoom') {
      openImage(product.image, `شوكولاتة ${product.name} من Pharolat`);
    } else if (action === 'variant') {
      selectedVariants[product.id] = button.dataset.variant === 'dark' ? 'dark' : 'milk';
      renderProducts();
    } else if (action === 'quantity') {
      const step = Number.parseInt(button.dataset.step, 10) || 0;
      selectedQuantities[product.id] = Math.max(1, Math.min(20, selectedQuantities[product.id] + step));
      renderProducts();
    } else if (action === 'add') {
      addToCart(product);
    }
  });

  // Cart actions.
  elements.cartItems.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-cart-action]');
    if (!button) return;
    const row = button.closest('[data-cart-id]');
    if (!row) return;
    const line = cart.find((item) => item.id === row.dataset.cartId && item.variant === row.dataset.cartVariant);
    if (!line) return;

    if (button.dataset.cartAction === 'remove') {
      cart = cart.filter((item) => item !== line);
      showToast('تم حذف الصنف من السلة');
    } else {
      const step = Number.parseInt(button.dataset.step, 10) || 0;
      line.quantity = Math.max(0, Math.min(99, line.quantity + step));
      if (line.quantity === 0) cart = cart.filter((item) => item !== line);
    }
    saveCart();
    renderCart();
  });

  // Search and sorting.
  elements.search.addEventListener('input', renderProducts);
  elements.sort.addEventListener('change', renderProducts);
  elements.clearSearch.addEventListener('click', () => {
    elements.search.value = '';
    elements.sort.value = 'default';
    renderProducts();
    elements.search.focus();
  });

  // Drawer controls.
  document.querySelectorAll('[data-open-cart]').forEach((button) => button.addEventListener('click', openDrawer));
  document.querySelectorAll('[data-close-cart]').forEach((button) => button.addEventListener('click', closeDrawer));
  elements.backdrop.addEventListener('click', closeDrawer);
  elements.checkoutButton.addEventListener('click', setCheckoutVisibility);
  elements.checkoutForm.addEventListener('submit', handleCheckoutSubmit);
  elements.checkoutForm.querySelectorAll('input, textarea').forEach((input) => {
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') markInvalid(input, false);
      elements.formError.hidden = true;
    });
  });

  // Image modals.
  document.querySelectorAll('[data-close-modal]').forEach((button) => button.addEventListener('click', closeImage));
  elements.modal.addEventListener('click', (event) => {
    if (event.target === elements.modal) closeImage();
  });
  elements.modal.addEventListener('close', () => document.body.classList.remove('modal-open'));
  document.getElementById('open-menu-image').addEventListener('click', () => openImage(CONFIG.menuImage, 'منيو Pharolat Chocolate والأسعار'));
  document.getElementById('open-menu-image-card').addEventListener('click', () => openImage(CONFIG.menuImage, 'منيو Pharolat Chocolate والأسعار'));

  // Mobile navigation.
  elements.menuToggle.addEventListener('click', () => {
    const expanded = elements.menuToggle.getAttribute('aria-expanded') === 'true';
    elements.menuToggle.setAttribute('aria-expanded', String(!expanded));
    elements.menuToggle.setAttribute('aria-label', expanded ? 'فتح القائمة' : 'إغلاق القائمة');
    elements.menu.classList.toggle('is-open', !expanded);
  });
  elements.menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    elements.menu.classList.remove('is-open');
    elements.menuToggle.setAttribute('aria-expanded', 'false');
    elements.menuToggle.setAttribute('aria-label', 'فتح القائمة');
  }));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (elements.drawer.classList.contains('is-open')) closeDrawer();
      if (elements.modal.open) closeImage();
    }
  });

  // Keep public contact details and key display images sourced from one config file.
  const heroImage = document.querySelector('.hero-image-frame img');
  if (heroImage) heroImage.src = CONFIG.heroImage;
  const menuPreview = document.querySelector('.menu-image-button img');
  if (menuPreview) menuPreview.src = CONFIG.menuImage;
  const whatsappLink = document.getElementById('whatsapp-contact');
  whatsappLink.href = `https://wa.me/${CONFIG.whatsappNumber}`;
  const instagramLink = document.getElementById('instagram-contact');
  instagramLink.href = CONFIG.instagramUrl;
  instagramLink.querySelector('strong').textContent = `@${CONFIG.instagramHandle}`;
  document.getElementById('current-year').textContent = String(new Date().getFullYear());

  renderProducts();
  renderCart();
})();
