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
  { en: 'WALNUT', ar: 'عين جمل', group: 'nuts',
    photo: { src: IMG + 'walnut-800.webp', srcset: IMG + 'walnut-800.webp 800w, ' + IMG + 'walnut-1600.webp 1600w' },
    alt: { en: 'Dark chocolate bar with walnuts', ar: 'لوح شوكولاتة داكنة بالعين جمل' } },
  { en: 'ALMOND', ar: 'لوز', group: 'nuts',
    photo: { src: IMG + 'almond-800.webp', srcset: IMG + 'almond-800.webp 800w, ' + IMG + 'almond-1600.webp 1600w', contain: true },
    alt: { en: 'Milk chocolate bar with almonds', ar: 'لوح شوكولاتة بالحليب باللوز' } },
  { en: 'HAZELNUT', ar: 'بندق', group: 'nuts',
    photo: { src: IMG + 'hazelnut-800.webp', srcset: IMG + 'hazelnut-800.webp 800w, ' + IMG + 'hazelnut-1600.webp 1600w' },
    alt: { en: 'Dark chocolate with hazelnut filling', ar: 'شوكولاتة داكنة بحشوة البندق' } },
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
  { en: 'COFFEE', ar: 'قهوة', group: 'coffee',
    photo: { src: IMG + 'coffee-800.webp', srcset: IMG + 'coffee-800.webp 800w, ' + IMG + 'coffee-1600.webp 1600w' },
    alt: { en: 'Dark chocolate with coffee-caramel filling', ar: 'شوكولاتة داكنة بحشوة القهوة والكراميل' } },
  { en: 'DUBAI', ar: 'دبي', group: 'coffee', photo: null },
  { en: 'COTTON CANDY', ar: 'غزل البنات', group: 'coffee',
    photo: { src: IMG + 'cotton-candy-800.webp', srcset: IMG + 'cotton-candy-800.webp 800w, ' + IMG + 'cotton-candy-1600.webp 1600w' },
    alt: { en: 'Cotton Candy: chocolate with mint-teal cream filling', ar: 'غزل البنات: شوكولاتة بحشوة كريمية خضراء مزرقة' } },
];

/* Moment Match — match a flavour to the customer's moment. No backend, pure JS. */
const MOMENTS = [
  {
    id: 'morning-coffee',
    ar: 'قهوة صبحية',
    en: 'Morning coffee',
    icon: '☕',
    groups: ['coffee', 'creamy'],
    types: ['Milk'],
    products: ['COFFEE', 'NUTELLA', 'LOTUS'],
    reasonAr: 'تبدأ يومك بحلاوة خفيفة مع الفنجان.',
    reasonEn: 'A light sweetness to start your day with the cup.'
  },
  {
    id: 'gift',
    ar: 'هدية لشخص خاص',
    en: 'A gift for someone special',
    icon: '🎁',
    groups: ['nuts', 'creamy'],
    types: ['Milk', 'Dark'],
    products: ['PISTACHIO', 'ALMOND', 'KINDER', 'NUTELLA'],
    reasonAr: 'نكهات فاخرة في علبة أنيقة تُهديها لمن تحب.',
    reasonEn: 'Premium flavours in an elegant box to gift.'
  },
  {
    id: 'treat',
    ar: 'مكافأة بعد يوم شاق',
    en: 'A treat after a long day',
    icon: '🍫',
    groups: ['creamy'],
    types: ['Milk'],
    products: ['NUTELLA', 'KINDER', 'COTTON CANDY', 'CARAMEL'],
    reasonAr: 'حشوة كريمية ومُرضية تستحقها بعد التعب.',
    reasonEn: 'A creamy, satisfying filling you deserve.'
  },
  {
    id: 'friends',
    ar: 'قعدة مع أصحاب',
    en: 'A hangout with friends',
    icon: '👥',
    groups: ['creamy', 'coffee'],
    types: ['Milk', 'Dark'],
    products: ['LOTUS', 'CARAMEL', 'DUBAI', 'COFFEE'],
    reasonAr: 'نكهات تشاركها مع من تحب في قعدة حلوة.',
    reasonEn: 'Flavours to share with the people you love.'
  },
  {
    id: 'myself',
    ar: 'شيء لنفسي فقط',
    en: 'Just a little something for me',
    icon: '🧋',
    groups: ['nuts', 'creamy', 'coffee'],
    types: ['Milk', 'Dark'],
    products: ['PISTACHIO', 'HAZELNUT', 'CARAMEL', 'COFFEE'],
    reasonAr: 'لحظة استرخاء خاصة بك وبالنكهة المفضلة.',
    reasonEn: 'A personal pause with your favourite flavour.'
  }
];

function momentById(id){return MOMENTS.find(m=>m.id===id);}
function matchProduct(momentId, type, groupId){
  const m = momentById(momentId);
  if(!m) return null;
  let candidates = PRODUCTS.filter(p=>{
    const typeOk = m.types.includes(type);
    const groupOk = groupId==='all' || p.group===groupId;
    const momentOk = m.products.includes(p.en);
    return typeOk && groupOk && momentOk;
  });
  if(candidates.length===0){
    candidates = PRODUCTS.filter(p=>m.types.includes(type) && (groupId==='all' || p.group===groupId));
  }
  if(candidates.length===0) return null;
  return candidates[0];
}

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

