'use strict';
/* Source catalogue is in catalogue.js. All prices derive from PRICES. */
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const storage = {get(k){try{return localStorage.getItem(k)}catch{return null}},set(k,v){try{localStorage.setItem(k,v)}catch{/* Private mode: basket remains usable in this tab. */}}};
let lang = storage.get('pharolat-language') === 'en' ? 'en' : 'ar';
let category = 'all';
let query = '';
let toastTimer;
const variants = new Map();
const t = (ar,en) => lang === 'ar' ? ar : en;
const escapeHTML = v => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const productID = p => p.en.toLowerCase().replace(/\s+/g,'-');
const productById = id => PRODUCTS.find(p => productID(p) === id);
const normalize = s => s.toLowerCase().normalize('NFKD').replace(/[\u064B-\u065F\u0670]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').trim();
const number = n => new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-GB').format(n);
const money = n => `${number(n)} ${t('جنيه','EGP')}`;
let basket = [];
try{
 const saved = JSON.parse(storage.get('pharolat-basket') || '[]');
 if(Array.isArray(saved)) for(const line of saved){
  if(!line || !productById(line.id) || !['Milk','Dark'].includes(line.type) || !Number.isInteger(line.qty) || line.qty < 1) continue;
  const prior = basket.find(x => x.id === line.id && x.type === line.type);
  if(prior) prior.qty = Math.min(99,prior.qty+line.qty);
  else basket.push({id:line.id,type:line.type,qty:Math.min(99,line.qty)});
 }
}catch{/* Ignore invalid or legacy saved data. */}
function persist(){storage.set('pharolat-basket',JSON.stringify(basket));}
function closeMenu(){ $('#main-nav').classList.remove('open'); $('#menu-button').setAttribute('aria-expanded','false'); }
function applyLanguage(){
 document.documentElement.lang=lang;
 document.documentElement.dir=lang==='ar'?'rtl':'ltr';
 $$('[data-ar][data-en]').forEach(el=>el.textContent=el.dataset[lang]);
 $$('[data-label-ar]').forEach(el=>el.setAttribute('aria-label',el.dataset[lang==='ar'?'labelAr':'labelEn']));
 $$('[data-alt-ar]').forEach(el=>el.alt=el.dataset[lang==='ar'?'altAr':'altEn']);
 $$('[data-placeholder-ar]').forEach(el=>el.placeholder=el.dataset[lang==='ar'?'placeholderAr':'placeholderEn']);
 $('#language').innerHTML=lang==='ar'?'EN <span aria-hidden="true">↗</span>':'عربي <span aria-hidden="true">↗</span>';
 $('#language').setAttribute('aria-label',t('Switch to English','التبديل إلى العربية'));
 document.title=t('فارولات شوكولاتة — قطعة صغيرة، بهجة كبيرة','Pharolat Chocolate — A little treat. A lovely moment.');
 $('meta[name="description"]').content=t('اكتشف ١١ نكهة من فارولات شوكولاتة. ميلك ١٣٠ جنيه ودارك ١٢٠ جنيه. كوّن طلبك وتواصل معنا على واتساب للتأكيد.','Explore 11 Pharolat chocolate flavours. Milk 130 EGP, dark 120 EGP. Build your bag and confirm your order on WhatsApp.');
 $('meta[property="og:locale"]').content=lang==='ar'?'ar_EG':'en_US';
 $('meta[property="og:locale:alternate"]').content=lang==='ar'?'en_US':'ar_EG';
 $('#year').textContent=new Date().getFullYear();
 storage.set('pharolat-language',lang);
 renderProducts();renderBasket();
 if(!$('#moment-step-1').hidden)renderMomentStep1();
 if(!$('#moment-step-2').hidden)renderMomentStep2();
 if(!$('#moment-step-3').hidden)renderMomentResult();
}
function groupName(group){const g=GROUPS.find(x=>x.id===group);return g[lang];}
function card(p){
 const id=productID(p), type=variants.get(id)||'Milk';
 const serial=String(PRODUCTS.indexOf(p)+1).padStart(2,'0');
 const image=p.photo?`<img src="${p.photo.src}" ${p.photo.srcset?`srcset="${p.photo.srcset}" sizes="(min-width:1100px) 22vw,(min-width:850px) 29vw,45vw"`:''} alt="${escapeHTML(p.alt[lang])}" loading="lazy" decoding="async" width="800" height="1200">`:`<div class="product-placeholder"><img src="brand-logo.svg" alt="" width="69" height="69"><b>${escapeHTML(p[lang])}</b><small dir="ltr">PHAROLAT CHOCOLATE</small><span class="photo-note">${t('صورة المنتج قريباً','Product photo coming soon')}</span></div>`;
 return `<article class="product" data-id="${id}"><div class="product-media${p.photo?.contain?' contain':''}"><span class="product-number" dir="ltr">N° ${serial}</span>${image}</div><div class="product-meta"><span>${groupName(p.group)}</span><span aria-hidden="true">✧</span></div><h3>${escapeHTML(p[lang])}<small dir="ltr">${escapeHTML(p.en)}</small></h3><div class="variant-picker" role="group" aria-label="${escapeHTML(t('نوع الشوكولاتة: ','Chocolate type: ')+p[lang])}">${['Milk','Dark'].map(v=>`<button class="variant" type="button" data-variant="${v}" aria-pressed="${v===type}"><span>${v==='Milk'?t('ميلك','Milk'):t('دارك','Dark')}</span><b>${number(PRICES[v])} <small>${t('جنيه','EGP')}</small></b></button>`).join('')}</div><button class="product-add" type="button" data-add="${id}" aria-label="${escapeHTML(t('أضف إلى السلة: ','Add to bag: ')+p[lang])}"><span>${t('أضف للسلة','Add to bag')}</span><span aria-hidden="true">+</span></button></article>`;
}
function renderProducts(){
 const filtered=PRODUCTS.filter(p=>(category==='all'||p.group===category)&&(!query||normalize(`${p.ar} ${p.en} ${groupName(p.group)}`).includes(normalize(query))));
 $('#products').innerHTML=filtered.map(card).join('');
 $('#no-results').hidden=filtered.length>0;
 $('#result-count').textContent=t(`${number(filtered.length)} من ${number(PRODUCTS.length)} نكهة`,`${filtered.length} of ${PRODUCTS.length} flavours`);
 $$('.filter').forEach(b=>{const active=b.dataset.filter===category;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
}
function notify(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2800);}
function addToBag(id){
 const type=variants.get(id)||'Milk';
 let row=basket.find(x=>x.id===id&&x.type===type);
 if(row&&row.qty===99){notify(t('الحد الأقصى ٩٩ لكل اختيار. تواصل معنا للطلبات الأكبر.','Maximum 99 per selection. Contact us for larger orders.'));return;}
 if(row)row.qty++;else basket.push({id,type,qty:1});
 persist();renderBasket();notify(t('اتضاف للسلة: ','Added to your bag: ')+productById(id)[lang]);
}
function orderURL(){
 const total=basket.reduce((s,r)=>s+PRICES[r.type]*r.qty,0);
 const lines=basket.map(r=>{const p=productById(r.id);return `${r.qty} × ${p[lang]} — ${r.type==='Milk'?t('ميلك','Milk'):t('دارك','Dark')} (${PRICES[r.type]} ${t('جنيه','EGP')}) = ${r.qty*PRICES[r.type]} ${t('جنيه','EGP')}`;});
 const text=[t('مرحباً فارولات! أود الاستفسار عن الطلب التالي:','Hello Pharolat! I would like to request the following order:'),'',...lines,'',t(`إجمالي المنتجات: ${total} جنيه`,`Product subtotal: ${total} EGP`),t('يرجى تأكيد التوفر ورسوم التوصيل والإجمالي النهائي.','Please confirm availability, delivery fees and the final total.')].join('\n');
 return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
function renderBasket(){
 const count=basket.reduce((s,r)=>s+r.qty,0),total=basket.reduce((s,r)=>s+r.qty*PRICES[r.type],0);
 $$('.bag-count').forEach(el=>el.textContent=number(count));
 $('#cart-footer').hidden=!count;
 $('#cart-total').textContent=money(total);
 $('#checkout').href=orderURL();
 $('#cart-items').innerHTML=!count?`<div class="empty-bag"><span aria-hidden="true">✧</span><h3>${t('لحظتك الحلوة لسه جاية','A little treat awaits')}</h3><p>${t('اختار نكهتك وابدأ تكوّن طلبك.','Choose your flavours and make it your own.')}</p><button type="button" class="button" data-continue>${t('اكتشف التشكيلة','Explore the collection')} ↗</button></div>`:basket.map(r=>{
 const p=productById(r.id),type=r.type==='Milk'?t('ميلك','Milk'):t('دارك','Dark');
 return `<div class="cart-row" data-id="${r.id}" data-type="${r.type}"><img class="cart-thumb${p.photo?'':' placeholder'}" src="${p.photo?p.photo.src:'brand-logo.svg'}" alt="${escapeHTML(p[lang])}" width="76" height="93"><div class="cart-detail"><h3>${escapeHTML(p[lang])}</h3><p class="variant-name">${type} · ${money(PRICES[r.type])}</p><div class="cart-row-actions"><div class="qty" role="group" aria-label="${escapeHTML(t('كمية ','Quantity of ')+p[lang]+' '+type)}"><button type="button" data-qty="-1" aria-label="${escapeHTML(t('تقليل كمية ','Decrease quantity of ')+p[lang]+' '+type)}">−</button><span>${number(r.qty)}</span><button type="button" data-qty="1" ${r.qty>=99?'disabled':''} aria-label="${escapeHTML(t('زيادة كمية ','Increase quantity of ')+p[lang]+' '+type)}">+</button></div><button class="remove" type="button" data-remove aria-label="${escapeHTML(t('إزالة ','Remove ')+p[lang]+' '+type)}">${t('إزالة','Remove')}</button></div></div><b class="line-price">${money(r.qty*PRICES[r.type])}</b></div>`;
 }).join('');
}
function openCart(){closeMenu();$('#cart').showModal();document.body.classList.add('locked');}
function closeCart(){if($('#cart').open)$('#cart').close();document.body.classList.remove('locked');}
$('#products').addEventListener('click',e=>{
 const add=e.target.closest('[data-add]');if(add){addToBag(add.dataset.add);return;}
 const button=e.target.closest('[data-variant]');if(!button)return;
 const article=button.closest('.product');variants.set(article.dataset.id,button.dataset.variant);
 $$('.variant',article).forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
});
$$('.filter').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.filter;renderProducts();}));
$('#search').addEventListener('input',e=>{query=e.target.value;renderProducts();});
$('#reset-filters').addEventListener('click',()=>{category='all';query='';$('#search').value='';renderProducts();$('#search').focus();});
$('#language').addEventListener('click',()=>{lang=lang==='ar'?'en':'ar';closeMenu();applyLanguage();});
$('#menu-button').addEventListener('click',()=>{const open=$('#main-nav').classList.toggle('open');$('#menu-button').setAttribute('aria-expanded',String(open));});
$$('#main-nav a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{
 if(e.key==='Escape')closeMenu();
 if(e.key==='Tab' && $('#cart').open){
  const focusable=$$('a[href],button:not(:disabled),input:not(:disabled),[tabindex="0"]',$('#cart')).filter(x=>x.getClientRects().length);
  const first=focusable[0],last=focusable[focusable.length-1];
  if(e.shiftKey && (document.activeElement===first || !$('#cart').contains(document.activeElement))){e.preventDefault();last.focus();}
  else if(!e.shiftKey && (document.activeElement===last || !$('#cart').contains(document.activeElement))){e.preventDefault();first.focus();}
 }
});
document.addEventListener('click',e=>{if(!e.target.closest('.header'))closeMenu();});
window.addEventListener('resize',()=>{if(window.innerWidth>850)closeMenu();});
$$('[data-open-cart]').forEach(b=>b.addEventListener('click',openCart));
$('#close-cart').addEventListener('click',closeCart);
$('#cart').addEventListener('close',()=>document.body.classList.remove('locked'));
$('#cart').addEventListener('cancel',e=>{e.preventDefault();closeCart();});
$('#cart').addEventListener('click',e=>{
 if(e.target===$('#cart')){const r=$('#cart').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeCart();}
});
$('#cart-items').addEventListener('click',e=>{
 if(e.target.closest('[data-continue]')){closeCart();$('#collection').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});return;}
 const b=e.target.closest('[data-qty],[data-remove]');if(!b)return;
 const row=b.closest('.cart-row'),index=basket.findIndex(r=>r.id===row.dataset.id&&r.type===row.dataset.type);if(index<0)return;
 const current=basket[index],action=b.hasAttribute('data-remove')?'remove':b.dataset.qty;
 if(action==='remove')basket.splice(index,1);else{current.qty=Math.min(99,current.qty+Number(action));if(current.qty<1)basket.splice(index,1);}
 persist();renderBasket();
 const remaining=$$('.cart-row').find(x=>x.dataset.id===row.dataset.id&&x.dataset.type===row.dataset.type);
 if(remaining){const target=action==='remove'?$('.remove',remaining):$(`[data-qty="${action}"]`,remaining);(target&&!target.disabled?target:$('.remove',remaining)).focus();}
 else{const first=$('.cart-row button')||$('[data-continue]');if(first)first.focus();}
});
/* ===== Moment Match — flavour finder ===== */
let momentStep = 1;
let selectedMoment = null;
let selectedType = 'Milk';
let selectedGroup = 'all';

function showMomentStep(step){
  momentStep = step;
  $$('.moment-step').forEach(el=>el.classList.add('hidden'));
  $('#moment-step-'+step).classList.remove('hidden');
  if(step===3) renderMomentResult();
}

function renderMomentStep1(){
  const container = $('#moment-step-1 .moment-choices');
  container.innerHTML = MOMENTS.map(m=>{
    const active = selectedMoment===m.id ? 'active' : '';
    return `<button class="moment-choice ${active}" type="button" data-moment="${m.id}" aria-pressed="${selectedMoment===m.id}">
      <span class="moment-icon" aria-hidden="true">${m.icon}</span>
      <span>${m[lang]}</span>
    </button>`;
  }).join('');
}

function renderMomentStep2(){
  $$('.variant[data-type]').forEach(b=>{
    const active = b.dataset.type===selectedType;
    b.setAttribute('aria-pressed',String(active));
    b.classList.toggle('active',active);
  });
  $$('.variant[data-group]').forEach(b=>{
    const active = b.dataset.group===selectedGroup;
    b.setAttribute('aria-pressed',String(active));
    b.classList.toggle('active',active);
  });
}

function renderMomentResult(){
  if(!selectedMoment) return;
  const match = matchProduct(selectedMoment, selectedType, selectedGroup);
  const m = momentById(selectedMoment);
  const nameEl = $('#moment-match-name'), reasonEl = $('#moment-match-reason');
  const typeEl = $('#moment-match-type'), priceEl = $('#moment-match-price');
  if(!match){
    nameEl.textContent = t('لا توجد نكهة مطابقة','No match found');
    reasonEl.textContent = '';
    typeEl.textContent = '';
    priceEl.textContent = '';
    return;
  }
  nameEl.textContent = match[lang] + (lang==='ar'?' — '+match.en:'');
  reasonEl.textContent = t(m.reasonAr, m.reasonEn);
  typeEl.textContent = selectedType==='Milk'?t('ميلك','Milk'):t('دارك','Dark');
  priceEl.textContent = money(PRICES[selectedType]);
  const btn = $('[data-add-match]');
  btn.dataset.add = productID(match);
  btn.innerHTML = `<span>${t('أضف للسلة','Add to bag')}</span><span aria-hidden="true">↗</span>`;
  const share = $('[data-share-match]');
  const text = t(
    `لحظتي: ${m.ar}\nنكهتي المقترحة: ${match.ar} (${selectedType==='Milk'?'ميلك':'دارك'})\n#فارولات #Pharolat`,
    `My moment: ${m.en}\nMy match: ${match.en} (${selectedType==='Milk'?'Milk':'Dark'})\n#Pharolat #فارولات`
  );
  share.onclick = ()=>{ location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`; };
}

/* Moment match event listeners */
$('#moment-step-1').addEventListener('click',e=>{
  const b = e.target.closest('[data-moment]');
  if(b){ selectedMoment = b.dataset.moment; renderMomentStep1(); return; }
  if(e.target.closest('[data-next]')){ showMomentStep(2); }
});
$('#moment-step-2').addEventListener('click',e=>{
  const b = e.target.closest('[data-type]');
  if(b){ selectedType = b.dataset.type; renderMomentStep2(); return; }
  const g = e.target.closest('[data-group]');
  if(g){ selectedGroup = g.dataset.group; renderMomentStep2(); return; }
  const back = e.target.closest('[data-back]');
  if(back){ showMomentStep(Number(back.dataset.back)); return; }
  const next = e.target.closest('[data-next]');
  if(next){ showMomentStep(Number(next.dataset.next)); }
});
$('#moment-step-3').addEventListener('click',e=>{
  const add = e.target.closest('[data-add-match]');
  if(add){ addToBag(add.dataset.add); return; }
  const back = e.target.closest('[data-back]');
  if(back){ showMomentStep(Number(back.dataset.back)); }
});

window.addEventListener('storage',e=>{if(e.key==='pharolat-basket')location.reload();});
applyLanguage();
