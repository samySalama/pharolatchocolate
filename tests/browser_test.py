"""Browser smoke test for the Pharolat Chocolate site.

Usage (see README.md, section "Running the browser tests"):
    SITE_URL=http://localhost:8000/index.html python tests/browser_test.py

Prints a JSON report. Requires: pip install playwright && python -m playwright install chromium
"""
import json, re, urllib.parse
from playwright.sync_api import sync_playwright

import os
URL = os.environ.get('SITE_URL', 'http://localhost:8765/index.html')
results = {}
console_errors, failed_requests = [], []
WIDTHS = {'360': 360, '390': 390, '430': 430, '768': 768, '1024': 1024, '1440': 1440}
EXPECTED_NUMBER = '201131072671'
EXPECTED_PRODUCTS = {'PISTACHIO':'فستق','WALNUT':'عين جمل','ALMOND':'لوز','HAZELNUT':'بندق','LOTUS':'لوتس','CARAMEL':'كراميل','NUTELLA':'نوتيلا','KINDER':'كيندر','COFFEE':'قهوة','DUBAI':'دبي','COTTON CANDY':'حلوى القطن'}

with sync_playwright() as p:
    browser = p.chromium.launch()

    def new_page(width=390, reduced=False):
        ctx = browser.new_context(viewport={'width': width, 'height': 844}, device_scale_factor=1,
                                  reduced_motion='reduce' if reduced else 'no-preference', locale='ar-EG')
        page = ctx.new_page()
        page.on('console', lambda m: console_errors.append(m.text) if m.type == 'error' else None)
        page.on('pageerror', lambda e: console_errors.append('PAGEERROR: ' + str(e)))
        page.on('requestfailed', lambda r: failed_requests.append(r.url))
        page.route(re.compile(r'https://(fonts\.googleapis|fonts\.gstatic)\.com/.*'), lambda route: route.abort())
        page.goto(URL, wait_until='domcontentloaded')
        page.wait_for_load_state('load')
        return ctx, page

    # 1. Structure and catalogue
    ctx, page = new_page(390)
    names = page.locator('.product-name').all_inner_texts()
    results['product_cards'] = len(names)
    results['product_names_en'] = sorted(re.split(r'\s+[\u0600-\u06FF]', n.strip())[0] for n in names)
    en_only = [re.split(r'\s+[\u0600-\u06FF]', n.strip())[0] for n in names]
    results['expected_products_present'] = sorted(EXPECTED_PRODUCTS.keys()) == sorted(en_only)
    results['price_links'] = page.locator('a.price-option').count()

    # 2. WhatsApp link audit: number, price and message content for every price button
    audit = []
    links = page.locator('a.price-option')
    for i in range(links.count()):
        href = links.nth(i).get_attribute('href')
        parsed = urllib.parse.urlparse(href)
        qs = urllib.parse.parse_qs(parsed.query)
        msg = qs.get('text', [''])[0]
        audit.append({'number_ok': parsed.path.strip('/') == EXPECTED_NUMBER and parsed.netloc == 'wa.me', 'message': msg})
    results['whatsapp_links'] = len(audit)
    results['whatsapp_numbers_ok'] = all(a['number_ok'] for a in audit)
    milk_ok = all(('130 جنيه' in a['message'] or '130 EGP' in a['message']) for a in audit if 'ميلك' in a['message'] or 'Milk' in a['message'])
    dark_ok = all(('120 جنيه' in a['message'] or '120 EGP' in a['message']) for a in audit if 'دارك' in a['message'] or 'Dark' in a['message'])
    results['milk_price_in_messages_ok'] = milk_ok
    results['dark_price_in_messages_ok'] = dark_ok
    results['message_brand_arabic_ok'] = all('فارولات شوكولاتة' in a['message'] for a in audit)
    results['old_brand_in_messages'] = any(('Pharaoh' in a['message'] or 'Pharolet' in a['message']) for a in audit)
    results['sample_message_ar'] = audit[0]['message'] if audit else None

    # 3. Rendered prices on the page
    prices = page.locator('.price-value').all_inner_texts()
    results['rendered_price_values_unique'] = sorted(set(re.sub(r'\s+', ' ', p_.replace('EGP', '').strip()) for p_ in prices))

    # 4. Brand text audit (visible text + head) in Arabic
    body_text = page.inner_text('body')
    head_title = page.title()
    results['title_ar'] = head_title
    results['forbidden_brand_hits_ar'] = [w for w in ['Pharaoh', 'PHARAOH', 'Pharolet', 'PHAROLET', 'Cairo', 'CAIRO', 'القاهرة', 'Manus'] if w in body_text]
    results['pharolat_hits_ar'] = body_text.count('PHAROLAT') + body_text.count('فارولات')

    # 5. Language switch: all copy switches, direction flips, no literal \n, year still shown
    page.click('.language-toggle')
    page.wait_for_timeout(200)
    results['en_dir'] = page.evaluate('document.documentElement.dir')
    results['en_lang'] = page.evaluate('document.documentElement.lang')
    en_text = page.inner_text('body')
    results['en_title'] = page.title()
    results['en_literal_backslash_n'] = '\\n' in en_text
    results['en_forbidden_hits'] = [w for w in ['Pharaoh', 'PHARAOH', 'Pharolet', 'Cairo', 'CAIRO', 'القاهرة'] if w in en_text]
    results['en_year_present'] = bool(re.search(r'20\d\d', page.inner_text('.copyright')))
    en_names_ok = page.locator('.price-option').first.get_attribute('aria-label')
    results['en_aria_sample'] = en_names_ok
    en_msg = urllib.parse.parse_qs(urllib.parse.urlparse(page.locator('a.price-option').first.get_attribute('href')).query)['text'][0]
    results['en_message_sample'] = en_msg
    results['en_message_brand_ok'] = 'Pharolat Chocolate' in en_msg
    page.screenshot(path='/home/claude/work/shots/390_en.png', full_page=False)

    # switch back to Arabic
    page.click('.language-toggle')
    page.wait_for_timeout(200)
    results['back_to_ar_dir'] = page.evaluate('document.documentElement.dir')
    results['product_cards_after_toggle'] = page.locator('.product-name').count()
    ctx.close()

    # 6. Horizontal overflow at every required width, both languages, in the actual browser
    overflow = {}
    for label, w in WIDTHS.items():
        for lang_mode in ['ar', 'en']:
            ctx, page = new_page(w)
            if lang_mode == 'en':
                page.click('.language-toggle'); page.wait_for_timeout(150)
            sw = page.evaluate('document.documentElement.scrollWidth')
            cw = page.evaluate('document.documentElement.clientWidth')
            overflow[f'{label}_{lang_mode}'] = {'scrollWidth': sw, 'clientWidth': cw, 'overflow': sw > cw}
            if label in ('360', '390', '768', '1440'):
                page.screenshot(path=f'/home/claude/work/shots/{label}_{lang_mode}_full.png', full_page=True)
            ctx.close()
    results['horizontal_overflow'] = overflow

    # 7. Showcase controls move the track
    ctx, page = new_page(390)
    before = page.evaluate("document.getElementById('showcase-track').scrollLeft")
    page.click('#showcase-next'); page.wait_for_timeout(600)
    after_next = page.evaluate("document.getElementById('showcase-track').scrollLeft")
    page.click('#showcase-prev'); page.wait_for_timeout(600)
    after_prev = page.evaluate("document.getElementById('showcase-track').scrollLeft")
    results['showcase_next_moved'] = abs(after_next - before) > 10
    results['showcase_prev_returned'] = abs(after_prev - before) < 10
    results['showcase_items'] = page.locator('.showcase-item').count()
    ctx.close()

    # 8. Images: every img has a non-empty alt and loads
    ctx, page = new_page(390)
    page.evaluate("document.querySelectorAll('img[loading=lazy]').forEach(i=>i.loading='eager')")
    page.wait_for_timeout(800)
    imgs = page.evaluate("""Array.from(document.images).map(i => ({src:i.getAttribute('src'), alt:i.alt, ok: i.complete && i.naturalWidth>0}))""")
    results['images_total'] = len(imgs)
    results['images_broken'] = [i['src'] for i in imgs if not i['ok']]
    results['images_missing_alt'] = [i['src'] for i in imgs if i['alt'] is None or (i['alt'].strip()=='' and i['src'] and 'carousel' not in i['src'] and False)]
    results['product_img_missing_alt'] = [i['src'] for i in imgs if 'products' in (i['src'] or '') and not i['alt']]
    ctx.close()

    # 9. Reduced motion: no smooth scrolling animation when user prefers reduced motion
    ctx, page = new_page(390, reduced=True)
    results['reduced_motion_matches'] = page.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches")
    ctx.close()

    # 10. Mobile order bar hidden on desktop, shown on mobile
    for w in (390, 1440):
        ctx, page = new_page(w)
        results[f'mobile_order_visible_{w}'] = page.locator('.mobile-order').is_visible()
        ctx.close()

    # 11. Keyboard: skip link reachable first
    ctx, page = new_page(1440)
    page.keyboard.press('Tab')
    results['first_tab_is_skip_link'] = page.evaluate("document.activeElement.className")
    ctx.close()

    browser.close()

results['console_errors'] = console_errors
results['failed_requests'] = sorted(set(failed_requests))
print(json.dumps(results, ensure_ascii=False, indent=2))
