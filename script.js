/* Pharolat Chocolate — catalogue, bilingual copy, WhatsApp ordering.
   No dependencies. Prices and the WhatsApp number are fixed by the business. */

const WHATSAPP_NUMBER = '201131072671';
const PRICES = { Milk: 130, Dark: 120 };
const BRAND = { en: 'Pharolat Chocolate', ar: 'فارولات شوكولاتة' };
const IMG = 'assets/images/products/';

const GROUPS = [
  { id: 'nuts', en: 'Nuts', ar: 'مكسرات' },
  { id: 'creamy', en: 'Creamy & Spreads', ar: 'كريمي ومدهونات' },
  { id: 'coffee', en: 'Coffee & Specials', ar: 'القهوة والمميّزات' },
];

/* 11 products. `photo` is null where no verified photo is assigned yet
   (text-only card). Descriptions are intentionally omitted: no unverified
   ingredient claims. Cotton Candy's Arabic name is غزل البنات (approved). */
const PRODUCTS = [
  { en: 'PISTACHIO', ar: 'فستق', group: 'nuts',
    photo: { src: IMG + 'pistachio-800.webp', srcset: IMG + 'pistachio-800.webp 800w, ' + IMG + 'pistachio-1600.webp 1600w' },
    alt: { en: 'Milk chocolate with green pistachio filling', ar: 'شوكولاتة بالحليب بحشوة الفستق الأخضر' } },
  { en: 'WALNUT', ar: 'عين جمل', group: 'nuts', photo: null },
  { en: 'ALMOND', ar: 'لوز', group: 'nuts',
    photo: { src: IMG + 'almond.webp', contain: true },
    alt: { en: 'Milk chocolate bar with almonds', ar: 'لوح شوكولاتة بالحليب باللوز' } },
  { en: 'HAZELNUT', ar: 'بندق', group: 'nuts', photo: null },
  { en: 'LOTUS', ar: 'لوتس', group: 'creamy',
    photo: { src: IMG + 'lotus-800.webp', srcset: IMG + 'lotus-800.webp 800w, ' + IMG + 'lotus-1600.webp 1600w' },
    alt: { en: 'Chocolate with biscuit-crumb filling', ar: 'شوكولاتة بحشوة بسكويت مفتت' } },
  { en: 'CARAMEL', ar: 'كراميل', group: 'creamy',
    photo: { src: IMG + 'caramel-800.webp', srcset: IMG + 'caramel-800.webp 800w, ' + IMG + 'caramel-1600.webp 1600w' },
    alt: { en: 'Dark chocolate with caramel filling', ar: 'شوكولاتة داكنة بحشوة الكراميل' } },
  { en: 'NUTELLA', ar: 'نوتيلا', group: 'creamy',
    photo: { src: IMG + 'nutella-800.webp', srcset: IMG + 'nutella-800.webp 800w, ' + IMG + 'nutella-1600.webp 1600w' },
    alt: { en: 'Milk chocolate with hazelnut-spread filling', ar: 'شوكولاتة بالحليب بحشوة معجون البندق' } },
  { en: 'KINDER', ar: 'كيندر', group: 'creamy',
    photo: { src: IMG + 'kinder-800.webp', srcset: IMG + 'kinder-800.webp 800w, ' + IMG + 'kinder-1600.webp 1600w' },
    alt: { en: 'Chocolate bar with pale cream filling', ar: 'لوح شوكولاتة بحشوة كريمية فاتحة' } },
  { en: 'COFFEE', ar: 'قهوة', group: 'coffee', photo: null },
  { en: 'DUBAI', ar: 'دبي', group: 'coffee', photo: null },
  { en: 'COTTON CANDY', ar: 'غزل البنات', group: 'coffee',
    photo: { src: IMG + 'cotton-candy-800.webp', srcset: IMG + 'cotton-candy-800.webp 800w, ' + IMG + 'cotton-candy-1600.webp 1600w' },
    alt: { en: 'Cotton Candy: chocolate with mint-teal cream filling', ar: 'غزل البنات: شوكولاتة بحشوة كريمية خضراء مزرقة' } },
];

const SHOWCASE = [
  { src: 'assets/images/carousel/still-life-1-800.webp', srcset: 'assets/images/carousel/still-life-1-800.webp 800w, assets/images/carousel/still-life-1-1600.webp 1600w',
    alt: { en: 'Broken dark chocolate with caramel and coffee beans', ar: 'شوكولاتة داكنة مكسورة مع كراميل وحبوب قهوة' } },
  { src: 'assets/images/carousel/still-life-2-800.webp', srcset: 'assets/images/carousel/still-life-2-800.webp 800w, assets/images/carousel/still-life-2-1600.webp 1600w',
    alt: { en: 'Stacked dark chocolate pieces with a Pharolat Chocolate box behind', ar: 'قطع شوكولاتة داكنة مكدسة وخلفها علبة فارولات شوكولاتة' } },
  { src: 'assets/images/carousel/still-life-3-800.webp', srcset: 'assets/images/carousel/still-life-3-800.webp 800w, assets/images/carousel/still-life-3-1600.webp 1600w',
    alt: { en: 'Dark chocolate bar with nut pieces and gold dust', ar: 'لوح شوكولاتة داكنة بقطع مكسرات وغبار ذهبي' } },
  { src: 'assets/images/carousel/still-life-4-800.webp', srcset: 'assets/images/carousel/still-life-4-800.webp 800w, assets/images/carousel/still-life-4-1600.webp 1600w',
    alt: { en: 'Milk chocolate pieces with pale green filling', ar: 'قطع شوكولاتة بالحليب بحشوة خضراء فاتحة' } },
];

let lang = 'ar';
const isEn = () => lang === 'en';
const t = (obj) => (isEn() ? obj.en : obj.ar);
const escapeAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const orderedProducts = GROUPS.flatMap((g) => PRODUCTS.filter((p) => p.group === g.id));

function orderMessage(product, type) {
  const price = PRICES[type];
  return isEn()
    ? `Hello ${BRAND.en}! I'd like to order ${product.en} (${type}, ${price} EGP).`
    : `مرحباً ${BRAND.ar}، أود طلب ${product.ar} (${type === 'Milk' ? 'ميلك' : 'دارك'}، ${price} جنيه).`;
}

function whatsappUrl(product, type) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(orderMessage(product, type))}`;
}

function renderCard(product) {
  const serial = String(orderedProducts.indexOf(product) + 1).padStart(2, '0');
  /* Text-only card: an empty ivory plate keeps the grid even. No unrelated photo is used. */
  const media = product.photo
    ? `<figure class="product-media${product.photo.contain ? ' product-media--contain' : ''}">
         <img src="${product.photo.src}"${product.photo.srcset ? ` srcset="${product.photo.srcset}"` : ''}
              sizes="(min-width: 900px) 22vw, (min-width: 600px) 45vw, 90vw"
              alt="${escapeAttr(t(product.alt))}" loading="lazy" decoding="async" />
       </figure>`
    : `<div class="product-plate" aria-hidden="true"><span>✳</span></div>`;
  const milkLabel = isEn() ? 'Milk' : 'ميلك';
  const darkLabel = isEn() ? 'Dark' : 'دارك';
  const priceLink = (type, label) => {
    const aria = isEn()
      ? `Order ${product.en} ${type} chocolate for ${PRICES[type]} EGP on WhatsApp`
      : `اطلب ${product.ar} ${label} بسعر ${PRICES[type]} جنيه على واتساب`;
    return `<a class="price-option" href="${whatsappUrl(product, type)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeAttr(aria)}">
              <span class="price-type">${label}</span>
              <span class="price-value">${PRICES[type]} <small>EGP</small></span>
            </a>`;
  };
  return `
    <article class="product${product.photo ? '' : ' product--text'}">
      ${media}
      <div class="product-body">
        <p class="product-serial" aria-hidden="true">${serial}</p>
        <h3 class="product-name">${product.en} <span class="product-translation" lang="ar">${product.ar}</span></h3>
        <div class="price-row">
          ${priceLink('Milk', milkLabel)}
          ${priceLink('Dark', darkLabel)}
        </div>
      </div>
    </article>`;
}

function renderCollections() {
  const root = document.getElementById('product-groups');
  root.innerHTML = GROUPS.map((g) => `
    <section class="product-group" aria-labelledby="group-${g.id}">
      <h3 class="group-title" id="group-${g.id}">${t(g)}</h3>
      <div class="product-grid">
        ${PRODUCTS.filter((p) => p.group === g.id).map(renderCard).join('')}
      </div>
    </section>`).join('');
}

function renderShowcase() {
  const track = document.getElementById('showcase-track');
  track.innerHTML = SHOWCASE.map((s) => `
    <figure class="showcase-item">
      <img src="${s.src}" srcset="${s.srcset}" sizes="(min-width: 900px) 30vw, 72vw" alt="" loading="lazy" decoding="async" />
    </figure>`).join('');
  SHOWCASE.forEach((s, i) => {
    track.children[i].querySelector('img').alt = t(s.alt);
  });
}

function applyCopy() {
  document.documentElement.lang = lang;
  document.documentElement.dir = isEn() ? 'ltr' : 'rtl';
  document.querySelectorAll('[data-copy-en][data-copy-ar]').forEach((el) => {
    el.textContent = isEn() ? el.dataset.copyEn : el.dataset.copyAr;
  });
  document.querySelectorAll('[data-aria-en][data-aria-ar]').forEach((el) => {
    el.setAttribute('aria-label', isEn() ? el.dataset.ariaEn : el.dataset.ariaAr);
  });
  document.querySelectorAll('[data-alt-en][data-alt-ar]').forEach((el) => {
    el.alt = isEn() ? el.dataset.altEn : el.dataset.altAr;
  });
  document.querySelector('.language-current').textContent = isEn() ? 'EN' : 'AR';
  document.querySelector('.language-toggle').setAttribute('aria-label', isEn() ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية');
  const title = isEn()
    ? `${BRAND.en} — Premium Egyptian Chocolate`
    : `${BRAND.ar} — شوكولاتة مصرية فاخرة`;
  document.title = title;
  document.querySelector('meta[name="description"]').setAttribute('content', isEn()
    ? 'Pharolat Chocolate — Premium Egyptian Chocolate. Choose your flavour and order on WhatsApp.'
    : 'فارولات شوكولاتة — شوكولاتة مصرية فاخرة. اختار نكهتك واطلب عبر واتساب.');
  document.querySelector('meta[property="og:title"]').setAttribute('content', title);
}

function setLanguage(next) {
  lang = next;
  applyCopy();
  renderCollections();
  renderShowcase();
}

function scrollShowcase(direction) {
  const track = document.getElementById('showcase-track');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rtl = document.documentElement.dir === 'rtl';
  const step = track.clientWidth * 0.8 * (rtl ? -direction : direction);
  track.scrollBy({ left: step, behavior: reduced ? 'auto' : 'smooth' });
}

document.querySelector('.language-toggle').addEventListener('click', () => {
  setLanguage(isEn() ? 'ar' : 'en');
});
document.getElementById('showcase-prev').addEventListener('click', () => scrollShowcase(-1));
document.getElementById('showcase-next').addEventListener('click', () => scrollShowcase(1));
document.getElementById('year').textContent = String(new Date().getFullYear());

setLanguage('ar');
