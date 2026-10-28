// CAIR SPA static site generator. Run: node site-src/build.mjs
// Writes plain HTML into the repo root so Vercel serves it with no build step.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SRC, '..');
const VERSION = 'v3i';
const ORIGIN = 'https://cairspa.com';
const TODAY = new Date().toISOString().slice(0, 10);

const SITE = {
  name: 'CAIR SPA',
  long: 'Comprehensive Aesthetic Integrative Regeneration Spa',
  phone: '(949) 688-5898', tel: '+19496885898',
  cell: '(949) 948-9399', cellTel: '+19499489399',
  email: 'CAIRmedspa@gmail.com',
  street: '20951 Brookhurst St, Ste 115', city: 'Huntington Beach', region: 'CA', zip: '92646',
  hours: 'Mon–Fri 9 AM – 6 PM · Sat–Sun by appointment',
  maps: 'https://www.google.com/maps/dir/?api=1&destination=CAIR+SPA+20951+Brookhurst+St+Ste+115+Huntington+Beach+CA+92646',
  mapEmbed: 'https://www.google.com/maps?q=20951+Brookhurst+St+Ste+115,+Huntington+Beach,+CA+92646&output=embed',
  reviews: 'https://www.google.com/maps/search/?api=1&query=CAIR+SPA+20951+Brookhurst+St+Huntington+Beach',
  oversight: 'Every service at CAIR SPA is performed under the oversight of Tran Plastic Surgery, led by Dr. Tuan Tran, a triple board-certified plastic, reconstructive and hand surgeon.',
  skincare: 'We carry medical-grade skincare from SkinCeuticals, plus Rejuran.',
};

// Real photography (Unsplash licence). Models, not patients.
const IMG = {
  hero: '1552693673-1bf958298935', consult: '1666886573531-48d2e3c2b684', why: '1761718210089-ba3bb5ccb54f',
  injector: '1746708810803-722593e53772',
  cat_injectables: '1746708810803-722593e53772', cat_skin: '1570172619644-dfd03ed5d881', cat_laser: '1598300195998-364bf445842c', cat_wellness: '1763310225009-50214e3c99d9',
  botox: '1746708810803-722593e53772', 'dermal-fillers': '1731355771418-f10ab62c9f86', sculptra: '1785861084191-3600dfc2a6d6',
  'prp-hair-restoration': '1785860458107-5be1a99d4188', 'prf-under-eye': '1785861378703-1c991c4548ef',
  facial: '1570172619644-dfd03ed5d881', 'rf-microneedling': 'local:m8-ignite', microneedling: 'local:microneedling-devices-v2', 'ombre-powder-brows': '1785860945533-918a531bcdeb', 'lymphatic-buccal-facial-massage': '1706795034830-de41aee06afa', 'skin-rejuvenation': '1741934023052-26baf5535088',
  aerolase: '1598300195998-364bf445842c', 'laser-hair-removal': '1700760933574-9f0f4ea9aa3b', 'skin-tag-removal': '1746806942799-b4db209e9a6b',
  'vein-treatment': '1700760933941-3a06a28fbf47', 'acne-treatment': '1660646463659-df77c1580723', 'melasma-treatment': '1785861775561-c6db7da314a0',
  'pigmented-lesions': '1732993486279-9d0f3b91adb2',
  'iv-infusion': '1763310225009-50214e3c99d9', 'nad-therapy': '1516574187841-cb9cc2ca948b', 'weight-loss': '1675270444770-1a6d1f69aefc',
  'thread-lift': '1761819922656-d1b77eef49c0', 'exosome-therapy': '1761718209708-9ab9ba1c7252', 'hair-transplant': '1633179963355-44f57f194d54',
};
const img = (id, w = 1200, h) => (String(id).startsWith('local:') ? `${ORIGIN}/images/inmode/${id.slice(6)}-4x3.jpg` : `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ''}&q=78`);
const pic = (id, alt, { w = 1200, ratio, eager = false, sizes = '100vw' } = {}) => {
  if (String(id).startsWith('local:')) {
    // Official InMode product composites: pick the file shaped for this slot (4:3 cards, taller hero)
    const base = id.slice(6), file = ratio && ratio < 1.25 ? `${base}-hero` : `${base}-4x3`, hh = Math.round(w / (ratio || 4 / 3));
    return `<picture><source type="image/webp" srcset="/images/inmode/${file}.webp"><img src="/images/inmode/${file}.jpg" alt="${esc(alt)}" width="${w}" height="${hh}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"></picture>`;
  }
  const ws = [480, 800, 1200, 1600].filter((x) => x <= Math.max(w, 480) * 1.4);
  const h = (x) => (ratio ? Math.round(x / ratio) : undefined);
  return `<img src="${img(id, w, h(w))}" srcset="${ws.map((x) => `${img(id, x, h(x))} ${x}w`).join(', ')}" sizes="${sizes}" alt="${esc(alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"${ratio ? ` width="${w}" height="${h(w)}"` : ''}>`;
};

const CATS = [
  { id: 'injectables', name: 'Injectables', blurb: 'Neurotoxin, fillers, Sculptra® and PRF/PRP for natural-looking refreshment.' },
  { id: 'skin', name: 'Skin', blurb: 'Morpheus8 RF microneedling, microneedling, customized facials and ombre powder brows.' },
  { id: 'laser', name: 'Aerolase Laser', blurb: 'One gentle medical laser for hair, veins, acne, melasma, spots and skin tags.' },
  { id: 'wellness', name: 'Wellness & More', blurb: 'IV and NAD+ therapy, weight loss, thread lifts, exosomes and lymphatic buccal facial massage.' },
  { id: 'hair', name: 'Hair', blurb: 'FUE hair transplant for a receding hairline or thinning crown.' },
];
const ORDER = ['botox', 'dermal-fillers', 'sculptra', 'prp-hair-restoration', 'prf-under-eye', 'rf-microneedling', 'microneedling', 'facial', 'ombre-powder-brows', 'skin-rejuvenation', 'aerolase', 'laser-hair-removal', 'skin-tag-removal', 'vein-treatment', 'acne-treatment', 'melasma-treatment', 'pigmented-lesions', 'iv-infusion', 'nad-therapy', 'weight-loss', 'thread-lift', 'exosome-therapy', 'lymphatic-buccal-facial-massage', 'hair-transplant'];

const services = ORDER.map((slug) => JSON.parse(fs.readFileSync(path.join(SRC, 'content/services', `${slug}.json`), 'utf8')));
const bySlug = Object.fromEntries(services.map((s) => [s.slug, s]));
const inCat = (c) => services.filter((s) => s.category === c);

const CITIES = JSON.parse(fs.readFileSync(path.join(SRC, 'content/areas.json'), 'utf8'));
const cityHref = (c) => `/${c.slug}`;
const AREAS = [
  ['Huntington Beach', '/huntington-beach-medical-spa'], ['Fountain Valley', '/fountain-valley-medical-spa'], ['Costa Mesa', '/costa-mesa-medical-spa'],
  ['Newport Beach', '/newport-beach-medical-spa'], ['Westminster', '/westminster-medical-spa'], ['Orange County', '/orange-county-medical-spa'],
];

function esc(s = '') { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
const reg = (s) => esc(s).replace(/®/g, '<sup>®</sup>');

const I = {
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
  chev: '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
};

// ---------- shared chrome ----------
function megaMenu() {
  const group = (c) => `<h4><a href="/services/#${c.id}">${esc(c.name)}</a></h4><ul>${inCat(c.id).map((s) => `<li><a href="/services/${s.slug}"><strong>${reg(s.name)}</strong><small>${reg(s.menuBlurb)}</small></a></li>`).join('')}</ul>`;
  const byId = Object.fromEntries(CATS.map((c) => [c.id, c]));
  const cols = [['injectables'], ['skin'], ['laser'], ['wellness', 'hair']].map((ids) => `<div class="mega-col">${ids.map((id) => group(byId[id])).join('')}</div>`).join('');
  return `<div class="mega" role="region" aria-label="Treatments"><div class="mega-inner">${cols}<a class="mega-feature" href="/#match">${pic(IMG.injector, 'Provider performing a cosmetic injection', { w: 600, ratio: 0.85, sizes: '300px' })}<div><b>Not sure where to start?</b><span>Describe your concern in your own words and we’ll suggest a treatment →</span></div></a></div><div class="mega-foot"><div class="wrap"><span>Every treatment starts with a free, no-pressure consultation.</span><a class="link-arrow" href="/services/">View all treatments</a></div></div></div>`;
}

function header(current) {
  const cur = (k) => (current === k ? ' aria-current="page"' : '');
  return `<a class="skip" href="#main">Skip to content</a>
<div class="topbar"><div class="wrap"><div class="tb-left"><span>${I.clock}${SITE.hours}</span><span>${I.pin}${SITE.street}, ${SITE.city}</span></div><div class="tb-right"><span>Services performed under Tran Plastic Surgery</span><a href="tel:${SITE.tel}">${I.phone}${SITE.phone}</a><a href="tel:${SITE.cellTel}">Cell ${SITE.cell}</a></div></div></div>
<header class="site-header"><div class="wrap nav">
  <a class="brand" href="/" aria-label="CAIR SPA home"><img src="/images/logo-phoenix-new.png" alt="" width="46" height="46"><span><span class="brand-name">CAIR SPA</span><span class="brand-sub">WELLNESS &amp; BEAUTY SPA</span></span></a>
  <nav aria-label="Main"><ul class="menu">
    <li class="has-mega"><button type="button" aria-expanded="false">Treatments${I.chev}</button>${megaMenu()}</li>
    <li class="has-drop"><button type="button" aria-expanded="false">Areas We Serve${I.chev}</button><ul class="drop">${AREAS.map(([n, h]) => `<li><a href="${h}">${n}</a></li>`).join('')}<li><a href="/orange-county-medical-spa#cities"><b>All areas we serve</b></a></li></ul></li>
    <li><a href="/products/"${cur('products')}>Products</a></li>
    <li><a href="/about/"${cur('about')}>About</a></li>
    <li><a href="/faq/"${cur('faq')}>FAQ</a></li>
    <li><a href="/contact/"${cur('contact')}>Contact</a></li>
  </ul></nav>
  <div class="nav-actions"><a class="nav-phone" href="tel:${SITE.tel}"><small>Call us</small><b>${SITE.phone}</b></a><a class="btn btn-primary btn-sm" href="/contact/#book">Book free consultation</a><button class="burger" type="button" aria-label="Open menu" data-open-drawer><span></span></button></div>
</div></header>
<div class="drawer" id="drawer" aria-hidden="true"><div class="drawer-bg" data-close-drawer></div><div class="drawer-panel" role="dialog" aria-label="Menu">
  <div class="drawer-head"><a class="brand" href="/"><img src="/images/logo-phoenix-new.png" alt="" width="40" height="40"><span class="brand-name" style="font-size:22px">CAIR SPA</span></a><button class="drawer-close" type="button" aria-label="Close menu" data-close-drawer>×</button></div>
  <div class="drawer-body">${CATS.map((c) => `<details><summary>${esc(c.name)}</summary><ul>${inCat(c.id).map((s) => `<li><a href="/services/${s.slug}">${reg(s.name)}</a></li>`).join('')}</ul></details>`).join('')}
    <details><summary>Areas We Serve</summary><ul>${CITIES.map((c) => `<li><a href="${cityHref(c)}">${c.name}</a></li>`).join('')}<li><a href="/orange-county-medical-spa">All of Orange County</a></li></ul></details>
    <a class="d-link" href="/services/">All treatments</a><a class="d-link" href="/products/">Products</a><a class="d-link" href="/about/">About</a><a class="d-link" href="/faq/">FAQ</a><a class="d-link" href="/contact/">Contact</a></div>
  <div class="drawer-foot"><a class="btn btn-primary" href="/contact/#book">Book free consultation</a><a class="btn btn-outline" href="tel:${SITE.tel}">${I.phone}Call ${SITE.phone}</a><a class="d-cell" href="tel:${SITE.cellTel}">Cell: ${SITE.cell}</a></div>
</div></div>`;
}

function footer() {
  const list = (cat) => inCat(cat).map((s) => `<li><a href="/services/${s.slug}">${reg(s.name)}</a></li>`).join('');
  return `<section class="cta-band"><div class="wrap"><div><h2>Begin with a free consultation.</h2><p>Tell us what you’d like to change. We’ll recommend a personalized plan and give you an exact quote before anything begins.</p></div><div class="ctas"><a class="btn btn-white" href="/contact/#book">${I.cal}Book free consultation</a><a class="btn btn-ghost" href="tel:${SITE.tel}">${I.phone}${SITE.phone}</a></div></div></section>
<footer class="site-footer"><div class="wrap">
  <div class="foot-top">
    <div class="foot-brand"><a class="brand" href="/"><img src="/images/logo-phoenix-new.png" alt="" width="46" height="46"><span><span class="brand-name">CAIR SPA</span><span class="brand-sub">WELLNESS &amp; BEAUTY SPA</span></span></a>
      <p>${SITE.long}. A wellness and beauty spa in Huntington Beach for injectables, skin, Aerolase laser, hair and wellness care.</p>
      <div class="foot-contact"><a href="${SITE.maps}" target="_blank" rel="noopener">${I.pin}<span>${SITE.street}<br>${SITE.city}, ${SITE.region} ${SITE.zip}</span></a><a href="tel:${SITE.tel}">${I.phone}${SITE.phone} (main)</a><a href="tel:${SITE.cellTel}">${I.phone}${SITE.cell} (cell)</a><a href="mailto:${SITE.email}">${I.mail}${SITE.email}</a><span>${I.clock}${SITE.hours}</span></div></div>
    <div><h5>Injectables</h5><ul>${list('injectables')}</ul></div>
    <div><h5>Skin & Laser</h5><ul>${list('skin')}${list('laser')}</ul></div>
    <div><h5>Wellness & More</h5><ul>${list('wellness')}</ul><h5 style="margin-top:28px">Hair</h5><ul>${list('hair')}</ul></div>
    <div><h5>Clinic</h5><ul><li><a href="/about/">About CAIR SPA</a></li><li><a href="/services/">All treatments</a></li><li><a href="/products/">Skincare products</a></li><li><a href="/faq/">FAQ</a></li><li><a href="/contact/">Contact & booking</a></li><li><a href="${SITE.reviews}" target="_blank" rel="noopener">Google reviews</a></li><li><a href="/privacy-policy.html">Privacy policy</a></li><li><a href="/terms-of-service.html">Terms of service</a></li></ul></div>
  </div>
  <div class="foot-areas"><b>Serving</b>${CITIES.map((c) => `<a href="${cityHref(c)}">${c.name}</a>`).join('')}<a href="/orange-county-medical-spa">Orange County</a></div>
  <div class="foot-legal"><p>${SITE.oversight} Results vary from person to person. A consultation is required to determine whether a treatment is right for you. Content on this site is for general information and is not medical advice.</p><div class="row"><span>© ${new Date().getFullYear()} CAIR SPA. All rights reserved.</span><span>Photography is illustrative; models shown are not CAIR SPA patients.</span></div></div>
</div></footer>
<div class="mbar"><a class="btn btn-outline" href="tel:${SITE.tel}">${I.phone}Call</a><a class="btn btn-primary" href="/contact/#book">Free consult</a></div>`;
}

const BUSINESS = {
  '@context': 'https://schema.org', '@type': 'HealthAndBeautyBusiness', '@id': `${ORIGIN}/#business`,
  name: SITE.name, alternateName: SITE.long, url: `${ORIGIN}/`, telephone: '+1-949-688-5898', email: SITE.email,
  contactPoint: [{ '@type': 'ContactPoint', telephone: '+1-949-688-5898', contactType: 'customer service', areaServed: 'US', availableLanguage: 'English' }, { '@type': 'ContactPoint', telephone: '+1-949-948-9399', contactType: 'customer service', areaServed: 'US' }],
  image: `${ORIGIN}/images/logo-phoenix-new.png`, logo: `${ORIGIN}/images/logo-phoenix-new.png`,
  description: `Wellness and beauty spa in Huntington Beach, CA offering neurotoxin, fillers, Sculptra, PRF/PRP, microneedling, customized facials, Aerolase laser treatments and wellness services, plus medical-grade SkinCeuticals skincare. Services are performed under the oversight of Tran Plastic Surgery.`,
  address: { '@type': 'PostalAddress', streetAddress: SITE.street, addressLocality: SITE.city, addressRegion: SITE.region, postalCode: SITE.zip, addressCountry: 'US' },
  geo: { '@type': 'GeoCoordinates', latitude: 33.6588, longitude: -117.9535 },
  openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '18:00' }],
  areaServed: CITIES.map((c) => ({ '@type': 'City', name: c.name })),
  makesOffer: services.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.name.replace(/®/g, ''), url: `${ORIGIN}/services/${s.slug}` } })),
};

function layout({ title, description, canonical, body, current, schema = [], ogImage = IMG.hero, catalog = false }) {
  const ld = [BUSINESS, ...schema].map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n');
  const cat = catalog ? `<script>window.CAIR_CATALOG=${JSON.stringify(services.map((s) => ({ slug: s.slug, name: s.name, blurb: s.menuBlurb, img: img(IMG[s.slug], 160, 160), keywords: [s.name, s.menuBlurb, ...s.goodFor, s.h1].join(' ').toLowerCase() })))};</script>` : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${ORIGIN}${canonical}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta property="og:type" content="website"><meta property="og:site_name" content="CAIR SPA"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${ORIGIN}${canonical}"><meta property="og:image" content="${img(ogImage, 1200, 630)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#b84342">
<link rel="icon" href="/images/logo-phoenix-new.png">
<link rel="preconnect" href="https://images.unsplash.com">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/cair-${VERSION}.css">
${ld}
</head>
<body>
${header(current)}
<main id="main">
${body}
</main>
${footer()}
${cat}<script src="/assets/cair-${VERSION}.js" defer></script>
</body>
</html>
`;
}

// ---------- building blocks ----------
const serviceOptions = () => CATS.map((c) => `<optgroup label="${esc(c.name)}">${inCat(c.id).map((s) => `<option>${esc(s.name)}</option>`).join('')}</optgroup>`).join('') + '<option>Not sure yet</option>';
function leadForm({ id = 'book', title = 'Request a call back', note = 'We’ll call to schedule your free consultation.', source, preselect, full = false }) {
  return `<form class="form-card" id="${id}" data-lead="${esc(source)}"><h3>${esc(title)}</h3><p>${esc(note)}</p>
  <input class="field" name="name" autocomplete="name" placeholder="Full name" aria-label="Full name" required>
  ${full ? `<div class="form-row"><input class="field" name="phone" type="tel" autocomplete="tel" placeholder="Phone" aria-label="Phone" required><input class="field" name="email" type="email" autocomplete="email" placeholder="Email (optional)" aria-label="Email"></div>` : `<input class="field" name="phone" type="tel" autocomplete="tel" placeholder="Phone number" aria-label="Phone number" required>`}
  <select class="field" name="service" aria-label="Treatment of interest">${preselect ? `<option>${esc(preselect)}</option>` : '<option value="">Treatment of interest</option>'}${serviceOptions()}</select>
  ${full ? '<textarea class="field" name="message" placeholder="Anything you’d like us to know? (optional)" aria-label="Message"></textarea>' : ''}
  <button class="btn btn-primary" type="submit">Request my free consultation</button>
  <p class="form-note">No obligation. We never share your information.</p></form>`;
}
const card = (s) => `<a class="card" href="/services/${s.slug}"><div class="card-img">${pic(IMG[s.slug], s.name, { w: 640, ratio: 4 / 3, sizes: '(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw' })}</div><div class="card-body"><h3>${reg(s.name)}</h3><p>${reg(s.menuBlurb)}</p><span class="link-arrow">Learn more</span></div></a>`;
function treatmentsBlock() {
  const block = (c) => {
    if (c.id === 'laser') {
      const hub = bySlug.aerolase;
      return `<div class="cat-block reveal" id="laser"><div class="laser-feature"><div class="lf-img">${pic(IMG.aerolase, 'Aerolase laser treatment', { w: 1000, sizes: '(max-width:1024px) 100vw, 50vw' })}</div><div class="lf-body"><span class="eyebrow">Aerolase laser</span><h3>One gentle laser, six common concerns</h3><p>${reg(hub.intro)}</p><div class="chip-grid">${inCat('laser').filter((s) => s.slug !== 'aerolase').map((s) => `<a href="/services/${s.slug}">${reg(s.name)}</a>`).join('')}</div><a class="btn btn-white" href="/services/aerolase">Explore Aerolase</a></div></div></div>`;
    }
    return `<div class="cat-block reveal" id="${c.id}"><div class="cat-title"><h3>${esc(c.name)}</h3><span class="muted">${reg(c.blurb)}</span></div><div class="cards">${inCat(c.id).map(card).join('')}</div></div>`;
  };
  return CATS.map(block).join('');
}
function faqBlock(faqs, { title = 'Frequently asked questions', intro = 'Can’t find your answer? Call us and we’ll help.' } = {}) {
  return `<div class="faq-grid"><div><span class="eyebrow">FAQ</span><h2 style="margin:14px 0 16px">${esc(title)}</h2><p class="muted" style="margin-bottom:28px">${esc(intro)}</p><a class="btn btn-outline" href="tel:${SITE.tel}">${I.phone}Call ${SITE.phone}</a></div><div class="faq-list">${faqs.map((f, i) => `<details${i === 0 ? ' open' : ''}><summary>${reg(f.q)}</summary><p>${reg(f.a)}</p></details>`).join('')}</div></div>`;
}
const faqSchema = (faqs) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
const crumbSchema = (items) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([n, u], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: `${ORIGIN}${u}` })) });
const oversightBand = () => `<div class="oversight reveal"><div class="ic">${I.shield}</div><div><h3>Expert oversight you can trust</h3><p>${SITE.oversight} Tran Plastic Surgery is located in our building at 20951 Brookhurst St.</p></div><a class="link-arrow" href="/about/">About our care</a></div>`;
const visitBlock = () => `<div class="visit"><div><span class="eyebrow">Visit us</span><h2 style="margin-top:14px">Find us in Huntington Beach</h2><dl class="info-list"><div><dt>Address</dt><dd>${SITE.street}<br>${SITE.city}, ${SITE.region} ${SITE.zip}</dd></div><div><dt>Phone</dt><dd><a href="tel:${SITE.tel}">${SITE.phone}</a> <span class="muted">(main)</span><br><a href="tel:${SITE.cellTel}">${SITE.cell}</a> <span class="muted">(cell)</span></dd></div><div><dt>Email</dt><dd><a href="mailto:${SITE.email}">${SITE.email}</a></dd></div><div><dt>Hours</dt><dd>Monday – Friday: 9:00 AM – 6:00 PM<br>Saturday – Sunday: By appointment</dd></div></dl><div style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn btn-primary" href="${SITE.maps}" target="_blank" rel="noopener">${I.pin}Get directions</a><a class="btn btn-outline" href="/contact/#book">Book a visit</a></div></div><div class="map"><iframe title="Map showing CAIR SPA location" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="${SITE.mapEmbed}"></iframe></div></div>`;

const GENERAL_FAQS = [
  { q: 'Is the consultation really free?', a: 'Yes. Your first consultation at CAIR SPA is free and has no obligation. We listen to your goals, assess your skin and recommend a personalized plan with an exact quote before any treatment begins.' },
  { q: 'Who performs treatments at CAIR SPA?', a: 'All services at CAIR SPA are performed under Tran Plastic Surgery. Tran Plastic Surgery is led by Dr. Tuan Tran, a triple board-certified plastic, reconstructive and hand surgeon located in the same building.' },
  { q: 'How much do treatments cost?', a: 'Pricing depends on your goals, the treatment and the amount needed, so every plan is personalized. Book a free consultation and you will receive an exact quote before anything begins.' },
  { q: 'Where is CAIR SPA located?', a: 'CAIR SPA is at 20951 Brookhurst St, Suite 115, Huntington Beach, CA 92646, close to Fountain Valley and a short drive from Costa Mesa, Westminster and Newport Beach.' },
  { q: 'What are your hours?', a: 'We are open Monday through Friday, 9:00 AM to 6:00 PM, and Saturday and Sunday by appointment. Call (949) 688-5898 or request a call back online to book.' },
  { q: 'Which treatments have little or no downtime?', a: 'Customized facials and IV therapy typically have no downtime. Neurotoxin and fillers may cause mild swelling or bruising for a day or two, and microneedling usually causes a few days of redness. Your provider will explain what to expect for your plan.' },
];

const PRODUCTS = [
  { id: 'skinceuticals', name: 'SkinCeuticals', tag: 'Medical-grade skincare', blurb: 'Science-backed professional skincare from L’Oréal’s Dermatological Beauty division, offered through physicians and skincare professionals.',
    body: ['SkinCeuticals is a professional skincare line known for its antioxidant serums, including C E Ferulic<sup>®</sup>, a vitamin C serum made with 15% pure vitamin C (L-ascorbic acid), 1% vitamin E and 0.5% ferulic acid.', 'The range also includes cleansers, correctors, moisturizers and daily sunscreens. Our team can help you build a simple at-home routine that complements your in-clinic treatments.'],
    points: ['Antioxidant serums such as C E Ferulic<sup>®</sup>', 'Correctors, moisturizers and cleansers', 'Daily sunscreen protection', 'Routine matched to your skin at your visit'] },
  { id: 'rejuran', name: 'Rejuran<sup>®</sup>', tag: 'Korean skin-renewal skincare', blurb: 'Skincare from Korea’s PharmaResearch, built around salmon-derived polynucleotides (PN/PDRN).',
    body: ['Rejuran is a Korean skincare brand from PharmaResearch, known for formulas built around salmon-derived polynucleotides (PN/PDRN), such as the Rejuran Healer Turnover Ampoule.', 'Ask our team which Rejuran products are in stock and whether they suit your skin and routine.'],
    points: ['Polynucleotide (PN/PDRN) formulas', 'Lightweight ampoules and creams', 'Easy to layer into a daily routine', 'Recommended after a skin assessment'] },
];
const productsTeaser = () => `<div class="prod-grid">${PRODUCTS.map((p) => `<a class="prod-card reveal" href="/products/#${p.id}"><span class="prod-tag">${p.tag}</span><span class="prod-mark">${p.name}</span><p>${p.blurb}</p><span class="link-arrow">Learn more</span></a>`).join('')}</div>`;

// ---------- pages ----------
function homePage() {
  const body = `
<section class="hero"><div class="wrap hero-grid">
  <div class="reveal in">
    <span class="eyebrow">Wellness &amp; beauty spa · Huntington Beach, CA</span>
    <h1>Natural-looking results, <em class="accent">medically guided.</em></h1>
    <p class="lead"><strong>${SITE.oversight}</strong> Neurotoxin, fillers, Sculptra<sup>®</sup>, Morpheus8 RF microneedling, customized facials, ombre powder brows, Aerolase laser care and FUE hair transplants in Huntington Beach, plus medical-grade SkinCeuticals skincare. Every plan starts with a free, no-pressure consultation.</p>
    <div class="ctas"><a class="btn btn-primary" href="#book">${I.cal}Book your free consultation</a><a class="btn btn-outline" href="tel:${SITE.tel}">${I.phone}Call ${SITE.phone}</a></div>
    <div class="trust-row"><span>${I.check}Free consultation</span><span>${I.check}Performed under Tran Plastic Surgery</span><span>${I.check}Weekends by appointment</span></div>
  </div>
  <div class="hero-media">
    <div class="hero-photo">${pic(IMG.hero, 'Client receiving a professional facial treatment', { w: 1100, ratio: 0.8, eager: true, sizes: '(max-width:1024px) 100vw, 50vw' })}</div>
    <div class="hero-badge"><span class="ic">${I.shield}</span><span><b>Performed under</b><small>Tran Plastic Surgery</small></span></div>
    ${leadForm({ title: 'Get a call back', note: 'Leave your number and we’ll call to book your free consultation.', source: 'Homepage Callback' })}
  </div>
</div></section>

<section class="glance"><div class="wrap"><span class="eyebrow">At a glance</span><p><strong>CAIR SPA</strong> (${SITE.long}) is a wellness and beauty spa at ${SITE.street} in Huntington Beach, CA. It offers neurotoxin, HA fillers, Sculptra, PRF/PRP for hair and under-eyes, Morpheus8 radiofrequency microneedling, microneedling, customized facials, ombre powder brows and Aerolase laser treatments for hair removal, skin tags, veins, acne, melasma and pigmented lesions, plus IV and NAD+ therapy, weight loss, thread lifts, exosome therapy, lymphatic buccal facial massage and FUE hair transplants. ${SITE.oversight} ${SITE.skincare} Consultations are free. Hours are Monday to Friday, 9 AM to 6 PM, with Saturday and Sunday by appointment.</p></div></section>

<section class="sec" id="treatments"><div class="wrap">
  <div class="sec-head reveal"><div><span class="eyebrow">Treatments</span><h2>Care for face, skin, hair and body</h2></div><p>Every treatment has its own page with what to expect, downtime and answers to common questions. Not sure which is right for you? That’s what the free consultation is for.</p></div>
  ${treatmentsBlock()}
</div></section>

<section class="sec bg-white" id="products"><div class="wrap">
  <div class="sec-head reveal"><div><span class="eyebrow">Skincare we carry</span><h2>Medical-grade products for home care</h2></div><p>${SITE.skincare} Ask our team which products fit your skin and your treatment plan at your visit.</p></div>
  ${productsTeaser()}
  <p style="margin-top:28px"><a class="link-arrow" href="/products/">View all products</a></p>
</div></section>

<section class="sec bg-white" id="match"><div class="wrap matcher">
  <div class="reveal"><span class="eyebrow">Find your treatment</span><h2 style="margin:14px 0 18px">Tell us what bothers you. We’ll point you in the right direction.</h2><p class="lead">Describe your concern in your own words, like “dark spots on my cheeks” or “my under-eyes look tired”, and we’ll suggest treatments to ask about at your consultation.</p><p class="muted" style="font-size:13.5px;margin-top:18px">Suggestions are general information, not a diagnosis. Your provider will confirm what’s right for you.</p></div>
  <div class="matcher-box reveal"><form id="matcher-form"><label for="concern">What would you like to improve?</label>
    <div class="matcher-examples"><button type="button" data-example="I have brown spots on my cheeks from the sun">Sun spots</button><button type="button" data-example="My forehead lines make me look tired">Forehead lines</button><button type="button" data-example="I’m tired of shaving my legs">Unwanted hair</button><button type="button" data-example="My hair is thinning on top">Thinning hair</button></div>
    <textarea class="field" id="concern" name="concern" maxlength="500" placeholder="e.g. I have acne scars and uneven texture on my cheeks" required></textarea>
    <button class="btn btn-primary" type="submit" style="width:100%">Find my treatment</button></form>
    <div class="matcher-results" id="matcher-results" aria-live="polite"></div></div>
</div></section>

<section class="sec"><div class="wrap">
  <div class="center-head reveal"><span class="eyebrow">How it works</span><h2>From first visit to results you love</h2><p class="muted">No pressure and no surprise pricing. You’ll know the plan and the cost before anything starts.</p></div>
  <div class="steps">
    <div class="step reveal"><div class="num">01</div><h3>Free consultation</h3><p>Tell us what you’d like to change. We assess your skin and goals and answer every question.</p></div>
    <div class="step reveal"><div class="num">02</div><h3>Your personal plan</h3><p>A clear plan with recommended treatments, number of sessions, expected downtime and an exact quote.</p></div>
    <div class="step reveal"><div class="num">03</div><h3>Treatment & follow-up</h3><p>Relax in a calm, private room. We check in after your visit to make sure you love the result.</p></div>
  </div>
</div></section>

<section class="sec bg-white"><div class="wrap split">
  <div class="split-photo reveal">${pic(IMG.why, 'Calm treatment room with skincare products', { w: 1000, ratio: 1 / 1.05, sizes: '(max-width:1024px) 100vw, 50vw' })}</div>
  <div class="reveal"><span class="eyebrow">Why CAIR SPA</span><h2 style="margin:14px 0 18px">Expert care, spa-level comfort</h2><p class="lead">We pair expert care with a calm, unhurried experience, so you leave looking like yourself on your best day.</p>
    <ul class="ticks"><li><b>Expert oversight</b><span>${SITE.oversight}</span></li><li><b>Natural-looking results</b><span>A conservative approach tailored to your features.</span></li><li><b>Personalized plans</b><span>Treatments matched to your goals, skin and budget.</span></li><li><b>Clear, upfront quotes</b><span>You know the exact cost before any treatment.</span></li></ul>
    <div style="margin-top:36px;display:flex;gap:12px;flex-wrap:wrap"><a class="btn btn-primary" href="#book">Book free consultation</a><a class="btn btn-outline" href="/about/">About CAIR SPA</a></div></div>
</div></section>

<section class="sec-sm"><div class="wrap">${oversightBand()}</div></section>

<section class="sec bg-dark"><div class="wrap">
  <div class="center-head reveal"><span class="eyebrow">Client reviews</span><h2>Hear it from our clients</h2><p style="color:#d9c4c0">We only share real reviews from verified clients. Read them, or leave your own, on our Google Business Profile.</p></div>
  <div class="reviews-empty reveal"><a class="btn btn-white" href="${SITE.reviews}" target="_blank" rel="noopener">Read our Google reviews</a></div>
</div></section>

<section class="sec bg-white" id="faq"><div class="wrap">${faqBlock(GENERAL_FAQS, { title: 'Questions before your first visit' })}</div></section>

<section class="sec"><div class="wrap">${visitBlock()}</div></section>`;
  return layout({
    title: 'Wellness & Beauty Spa in Huntington Beach, CA | CAIR SPA',
    description: 'CAIR SPA is a Huntington Beach wellness and beauty spa for neurotoxin, fillers, Sculptra, PRF/PRP, facials, microneedling and Aerolase laser. Book a free consultation.',
    canonical: '/', body, current: 'home', catalog: true, schema: [faqSchema(GENERAL_FAQS), { '@context': 'https://schema.org', '@type': 'WebSite', name: 'CAIR SPA', url: `${ORIGIN}/` }],
  });
}

function servicePage(s) {
  const cat = CATS.find((c) => c.id === s.category);
  const related = s.related.map((r) => bySlug[r]).filter(Boolean).slice(0, 3);
  const body = `
<section class="page-hero"><div class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/services/">Treatments</a><span aria-hidden="true">/</span><a href="/services/#${cat.id}">${esc(cat.name)}</a><span aria-hidden="true">/</span><span>${reg(s.name)}</span></nav>
  <div class="page-hero-grid">
    <div><span class="eyebrow">${esc(cat.name)}</span><h1>${reg(s.h1)}</h1><p class="lead">${reg(s.intro)}</p>
      <div class="ctas"><a class="btn btn-primary" href="#book">${I.cal}Book free consultation</a><a class="btn btn-outline" href="tel:${SITE.tel}">${I.phone}${SITE.phone}</a></div></div>
    <div class="page-hero-photo">${pic(IMG[s.slug], s.name, { w: 1100, ratio: 5 / 4.4, eager: true, sizes: '(max-width:1024px) 100vw, 46vw' })}</div>
  </div>
</div></section>
<div class="wrap"><div class="facts">${s.quickFacts.map((f) => `<div><small>${esc(f.label)}</small><b>${reg(f.value)}</b></div>`).join('')}</div></div>

<section class="sec"><div class="wrap content-grid">
  <div>
    <span class="eyebrow">Overview</span><h2 style="margin:14px 0 24px">What is ${reg(s.name)}?</h2>
    <div class="prose">${s.whatIs.map((p) => `<p>${reg(p)}</p>`).join('')}</div>
    <h3 style="margin:48px 0 8px">Who it’s for</h3>
    <ul class="ticks single">${s.goodFor.map((g) => `<li><span style="color:var(--ink-2);font-size:16px">${reg(g)}</span></li>`).join('')}</ul>
  </div>
  <aside class="sticky-card">${leadForm({ title: `Ask about ${s.name.replace(/®/g, '')}`, note: 'Free consultation. We’ll call you to book.', source: `Service Page: ${s.name}`, preselect: s.name })}</aside>
</div></section>

${s.devices ? `<section class="sec bg-sand" id="devices"><div class="wrap">
  <div class="sec-head reveal"><div><span class="eyebrow">Our technology</span><h2>The devices we use</h2></div><p>Your provider chooses the device and settings for your skin and goals at your free consultation.</p></div>
  <div class="dev-grid">${s.devices.map((d) => `<div class="dev-card reveal"><div class="dev-img"><img src="/images/inmode/${d.img}" alt="${esc(d.name)} ${esc(d.label.toLowerCase())}" loading="lazy" decoding="async"></div>${d.logo ? `<img class="dev-logo" src="/images/inmode/${d.logo}" alt="${esc(d.name)} logo" loading="lazy">` : ''}<h3>${esc(d.name)}</h3><span class="dev-label">${esc(d.label)}</span><p>${esc(d.text)}</p></div>`).join('')}</div>
</div></section>` : ''}

<section class="sec bg-white"><div class="wrap">
  <div class="center-head reveal"><span class="eyebrow">The process</span><h2>How ${reg(s.name)} works at CAIR SPA</h2></div>
  <div class="steps">${s.steps.map((st, i) => `<div class="step reveal"><div class="num">0${i + 1}</div><h3>${reg(st.title)}</h3><p>${reg(st.text)}</p></div>`).join('')}</div>
</div></section>

<section class="sec"><div class="wrap">
  <div class="sec-head reveal"><div><span class="eyebrow">What to expect</span><h2>Before, during and after</h2></div><p>Every plan is personalized. Your provider will walk you through preparation and aftercare at your consultation.</p></div>
  <div class="expect"><div class="reveal"><h3>Before</h3><p>${reg(s.expect.before)}</p></div><div class="reveal"><h3>During</h3><p>${reg(s.expect.during)}</p></div><div class="reveal"><h3>After</h3><p>${reg(s.expect.after)}</p></div></div>
  <div style="margin-top:40px">${oversightBand()}</div>
</div></section>

<section class="sec bg-white" id="faq"><div class="wrap">${faqBlock(s.faqs, { title: `${s.name.replace(/®/g, '')} questions, answered` })}<p class="disclaimer">${SITE.oversight} Results vary. Information on this page is general and is not a substitute for a consultation with a qualified provider.</p></div></section>

<section class="sec"><div class="wrap">
  <div class="sec-head reveal"><div><span class="eyebrow">Related treatments</span><h2>Often paired with ${reg(s.name)}</h2></div><p><a class="link-arrow" href="/services/">See all treatments</a></p></div>
  <div class="cards" style="grid-template-columns:repeat(3,1fr)">${related.map(card).join('')}</div>
</div></section>`;
  return layout({
    title: s.metaTitle, description: s.metaDescription, canonical: `/services/${s.slug}`, body, current: 'services', ogImage: IMG[s.slug],
    schema: [
      { '@context': 'https://schema.org', '@type': 'Service', name: s.name.replace(/®/g, ''), description: s.intro, url: `${ORIGIN}/services/${s.slug}`, image: img(IMG[s.slug], 1200), provider: { '@id': `${ORIGIN}/#business` } },
      faqSchema(s.faqs), crumbSchema([['Home', '/'], ['Treatments', '/services/'], [s.name.replace(/®/g, ''), `/services/${s.slug}`]]),
    ],
  });
}

function servicesHub() {
  const body = `
<section class="page-hero"><div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span>Treatments</span></nav>
  <div class="page-hero-grid"><div><span class="eyebrow">All treatments</span><h1>Treatments at our Huntington Beach wellness &amp; beauty spa</h1><p class="lead">Explore injectables, skin treatments, Aerolase laser care and wellness services at CAIR SPA. ${SITE.oversight}</p><div class="ctas"><a class="btn btn-primary" href="/contact/#book">${I.cal}Book free consultation</a><a class="btn btn-outline" href="/#match">Help me choose</a></div></div>
  <div class="page-hero-photo">${pic(IMG.injector, 'Provider performing a cosmetic injection', { w: 1100, ratio: 5 / 4.4, eager: true, sizes: '(max-width:1024px) 100vw, 46vw' })}</div></div></div></section>
<section class="sec"><div class="wrap">${treatmentsBlock()}</div></section>`;
  return layout({ title: 'Treatments | Wellness & Beauty Spa Huntington Beach | CAIR SPA', description: 'Explore every treatment at CAIR SPA in Huntington Beach: neurotoxin, fillers, Sculptra, PRF/PRP, facials, microneedling, Aerolase laser and wellness. Free consultation.', canonical: '/services/', body, current: 'services', schema: [crumbSchema([['Home', '/'], ['Treatments', '/services/']])] });
}

function aboutPage() {
  const body = `
<section class="page-hero"><div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span>About</span></nav>
  <div class="page-hero-grid"><div><span class="eyebrow">About CAIR SPA</span><h1>A Huntington Beach wellness &amp; beauty spa built on careful, natural results</h1><p class="lead">CAIR stands for ${SITE.long}. We bring medical aesthetics, skin care and wellness together under one roof on Brookhurst Street, with a calm experience and a conservative, personalized approach.</p></div>
  <div class="page-hero-photo">${pic(IMG.why, 'Treatment room at a beauty spa', { w: 1100, ratio: 5 / 4.4, eager: true, sizes: '(max-width:1024px) 100vw, 46vw' })}</div></div></div></section>
<section class="sec"><div class="wrap">${oversightBand()}</div></section>
<section class="sec bg-white"><div class="wrap split"><div class="reveal"><span class="eyebrow">Our approach</span><h2 style="margin:14px 0 18px">Look like yourself, refreshed</h2><div class="prose"><p>Good aesthetic care starts with listening. At your free consultation we talk through what you want to change, assess your skin and features, and recommend only what makes sense for you.</p><p>You’ll leave with a clear plan, realistic expectations and an exact quote. There is no pressure to book on the spot.</p></div>
  <ul class="ticks"><li><b>Free consultations</b><span>No obligation, ever.</span></li><li><b>Under one roof</b><span>Injectables, skin, laser and wellness.</span></li><li><b>Expert oversight</b><span>Performed under Tran Plastic Surgery.</span></li><li><b>Convenient location</b><span>${SITE.street}, Huntington Beach.</span></li></ul></div>
  <div class="split-photo reveal">${pic(IMG.consult, 'Provider discussing a treatment plan with a client', { w: 1000, ratio: 1 / 1.05, sizes: '(max-width:1024px) 100vw, 50vw' })}</div></div></section>
<section class="sec"><div class="wrap">${visitBlock()}</div></section>`;
  return layout({ title: 'About CAIR SPA | Wellness & Beauty Spa in Huntington Beach', description: 'Learn about CAIR SPA, a Huntington Beach wellness and beauty spa offering injectables, skin, Aerolase laser and wellness care performed under Tran Plastic Surgery.', canonical: '/about/', body, current: 'about', schema: [crumbSchema([['Home', '/'], ['About', '/about/']])] });
}

function productsPage() {
  const blocks = PRODUCTS.map((p, i) => `<section class="sec${i % 2 ? ' bg-white' : ''}" id="${p.id}"><div class="wrap prod-row">
  <div class="prod-panel reveal"><span class="prod-tag">${p.tag}</span><span class="prod-mark">${p.name}</span></div>
  <div class="reveal"><span class="eyebrow">${p.tag}</span><h2 style="margin:14px 0 18px">${p.name}</h2><div class="prose">${p.body.map((t) => `<p>${t}</p>`).join('')}</div>
    <ul class="ticks">${p.points.map((t) => `<li><b>${t}</b></li>`).join('')}</ul>
    <div style="margin-top:32px;display:flex;gap:12px;flex-wrap:wrap"><a class="btn btn-primary" href="/contact/#book">Ask about ${p.name}</a><a class="btn btn-outline" href="tel:${SITE.tel}">${I.phone}Call ${SITE.phone}</a></div></div>
</div></section>`).join('\n');
  const body = `
<section class="page-hero"><div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span>Products</span></nav><span class="eyebrow">Products</span><h1>Medical-grade skincare at CAIR SPA</h1><p class="lead">${SITE.skincare} Our team can recommend products that suit your skin and support your in-clinic treatments. Stop by or call to ask what’s in stock.</p><div class="ctas"><a class="btn btn-primary" href="/contact/#book">${I.cal}Book free consultation</a><a class="btn btn-outline" href="tel:${SITE.tel}">${I.phone}Call ${SITE.phone}</a></div></div></section>
${blocks}
<section class="sec-sm"><div class="wrap"><p class="disclaimer">Products are recommended after a skin assessment and availability may vary. SkinCeuticals and C E Ferulic are trademarks of L’Oréal; Rejuran is a trademark of PharmaResearch. CAIR SPA is not affiliated with or endorsed by these companies.</p></div></section>
<section class="sec-sm"><div class="wrap">${oversightBand()}</div></section>
<section class="sec"><div class="wrap">${visitBlock()}</div></section>`;
  return layout({ title: 'Skincare Products | SkinCeuticals & Rejuran | CAIR SPA Huntington Beach', description: 'CAIR SPA in Huntington Beach carries medical-grade SkinCeuticals skincare, including C E Ferulic, plus Rejuran. Ask our team which products suit your skin.', canonical: '/products/', body, current: 'products', schema: [crumbSchema([['Home', '/'], ['Products', '/products/']])] });
}

const cityCard = (c) => `<a class="city-card" href="${cityHref(c)}"><b>${c.name}</b><span>${c.home ? 'Our home city' : `About ${c.mi} miles`}</span></a>`;

function cityPage(c) {
  const where = c.home ? 'in Huntington Beach' : `near ${c.name}`;
  const faqs = [
    c.home
      ? { q: 'Where is CAIR SPA in Huntington Beach?', a: `CAIR SPA is at ${SITE.street}, Huntington Beach, CA ${SITE.zip}.` }
      : { q: `How far is CAIR SPA from ${c.name}?`, a: `CAIR SPA is about ${c.mi} miles from ${c.name}, roughly ${c.min} minutes by car without traffic. The usual route is ${c.route}. We are at ${SITE.street}, Huntington Beach.` },
    { q: 'Are you open on weekends?', a: 'Our regular hours are Monday to Friday, 9 AM to 6 PM. Saturday and Sunday appointments are available by appointment, so call us to book a weekend visit.' },
    { q: 'Is the consultation free?', a: 'Yes. Every treatment starts with a free, no-obligation consultation, and you get an exact quote before anything begins.' },
    { q: 'Who oversees treatments at CAIR SPA?', a: SITE.oversight },
  ];
  const nearby = CITIES.filter((x) => x.slug !== c.slug).sort((a, b) => (a.mi || 0) - (b.mi || 0)).slice(0, 6);
  const getting = c.home
    ? `<dl class="info-list"><div><dt>Address</dt><dd>${SITE.street}<br>${SITE.city}, ${SITE.region} ${SITE.zip}</dd></div><div><dt>Hours</dt><dd>Monday – Friday: 9:00 AM – 6:00 PM<br>Saturday – Sunday: By appointment</dd></div>${c.areas.length ? `<div><dt>Neighborhoods</dt><dd>${c.areas.join(', ')} and the rest of Huntington Beach</dd></div>` : ''}</dl>`
    : `<dl class="info-list"><div><dt>Distance</dt><dd>About ${c.mi} miles from ${c.name}</dd></div><div><dt>Drive time</dt><dd>Around ${c.min} minutes without traffic</dd></div><div><dt>Usual route</dt><dd>${c.route[0].toUpperCase() + c.route.slice(1)}</dd></div><div><dt>Hours</dt><dd>Monday – Friday: 9:00 AM – 6:00 PM<br>Saturday – Sunday: By appointment</dd></div>${c.areas.length ? `<div><dt>Coming from</dt><dd>${c.areas.join(', ')} and all of ${c.name}</dd></div>` : ''}</dl>`;
  const body = `
<section class="page-hero"><div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/orange-county-medical-spa">Areas we serve</a><span aria-hidden="true">/</span><span>${c.name}</span></nav>
  <div class="page-hero-grid"><div><span class="eyebrow">Areas we serve · ${c.name}</span><h1>Wellness &amp; beauty spa ${where}</h1><p class="lead">${c.intro} <strong>${SITE.oversight}</strong></p>
    <div class="ctas"><a class="btn btn-primary" href="#book">${I.cal}Book free consultation</a><a class="btn btn-outline" href="tel:${SITE.tel}">${I.phone}Call ${SITE.phone}</a></div>
    <div class="trust-row"><span>${I.check}Free consultation</span><span>${I.check}Weekends by appointment</span></div></div>
  <div>${leadForm({ title: 'Get a call back', note: `Leave your number and we’ll call to book your free consultation.`, source: `${c.name} page` })}</div></div></div></section>

<section class="sec bg-white"><div class="wrap split">
  <div class="reveal"><span class="eyebrow">${c.home ? 'Visit us' : `Getting here from ${c.name}`}</span><h2 style="margin:14px 0 18px">${c.home ? 'Your Huntington Beach wellness &amp; beauty spa' : `An easy trip from ${c.name}`}</h2>${getting}
    <div style="margin-top:28px;display:flex;gap:12px;flex-wrap:wrap"><a class="btn btn-primary" href="${SITE.maps}" target="_blank" rel="noopener">${I.pin}Get directions</a><a class="btn btn-outline" href="tel:${SITE.cellTel}">${I.phone}Cell ${SITE.cell}</a></div></div>
  <div class="reveal">${oversightBand()}</div>
</div></section>

<section class="sec" id="treatments"><div class="wrap">
  <div class="sec-head reveal"><div><span class="eyebrow">Treatments</span><h2>What ${c.home ? 'Huntington Beach' : c.name} clients can book at CAIR SPA</h2></div><p>Every treatment has its own page with what to expect, downtime and answers to common questions. Not sure which is right for you? Start with a free consultation.</p></div>
  ${treatmentsBlock()}
</div></section>

<section class="sec bg-white" id="products"><div class="wrap">
  <div class="sec-head reveal"><div><span class="eyebrow">Skincare we carry</span><h2>Medical-grade products for home care</h2></div><p>${SITE.skincare} Ask our team which products fit your skin at your visit.</p></div>
  ${productsTeaser()}
</div></section>

<section class="sec" id="faq"><div class="wrap">${faqBlock(faqs, { title: `Questions from ${c.home ? 'Huntington Beach' : c.name} clients` })}</div></section>

<section class="sec bg-white"><div class="wrap"><div class="center-head reveal"><span class="eyebrow">Also serving</span><h2>Nearby areas</h2></div><div class="city-grid city-grid-3">${nearby.map(cityCard).join('')}</div><p style="margin-top:24px;text-align:center"><a class="link-arrow" href="/orange-county-medical-spa#cities">All areas we serve</a></p></div></section>

<section class="sec"><div class="wrap">${visitBlock()}</div></section>`;
  const title = c.home ? 'Wellness & Beauty Spa in Huntington Beach, CA | CAIR SPA' : `Wellness & Beauty Spa near ${c.name}, CA | CAIR SPA`;
  const description = c.home
    ? `CAIR SPA is a wellness and beauty spa at ${SITE.street}, Huntington Beach. Injectables, skin, Aerolase laser and wellness care. Free consultations; weekends by appointment.`
    : `CAIR SPA in Huntington Beach is about ${c.mi} miles from ${c.name}. Injectables, skin, Aerolase laser and wellness care. Free consultations; weekends by appointment.`;
  return layout({ title, description, canonical: cityHref(c), body, current: 'areas', schema: [faqSchema(faqs), crumbSchema([['Home', '/'], ['Areas we serve', '/orange-county-medical-spa'], [c.name, cityHref(c)]])] });
}

function countyPage() {
  const faqs = [
    { q: 'Which Orange County cities does CAIR SPA serve?', a: `Clients visit us from across Orange County and nearby Long Beach, including ${CITIES.filter((c) => !c.home).map((c) => c.name).join(', ')}.` },
    { q: 'Are you open on weekends?', a: 'Our regular hours are Monday to Friday, 9 AM to 6 PM. Saturday and Sunday appointments are available by appointment.' },
    { q: 'Who oversees treatments at CAIR SPA?', a: SITE.oversight },
  ];
  const body = `
<section class="page-hero"><div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span>Areas we serve</span></nav>
  <div class="page-hero-grid"><div><span class="eyebrow">Areas we serve · Orange County</span><h1>Wellness &amp; beauty spa for Orange County</h1><p class="lead">CAIR SPA is at ${SITE.street} in Huntington Beach, central to much of Orange County and close to I-405 and Pacific Coast Highway. <strong>${SITE.oversight}</strong></p>
    <div class="ctas"><a class="btn btn-primary" href="#book">${I.cal}Book free consultation</a><a class="btn btn-outline" href="tel:${SITE.tel}">${I.phone}Call ${SITE.phone}</a></div>
    <div class="trust-row"><span>${I.check}Free consultation</span><span>${I.check}Weekends by appointment</span></div></div>
  <div>${leadForm({ title: 'Get a call back', note: 'Leave your number and we’ll call to book your free consultation.', source: 'Orange County page' })}</div></div></div></section>
<section class="sec bg-white" id="cities"><div class="wrap"><div class="center-head reveal"><span class="eyebrow">Areas we serve</span><h2>Distance from your city</h2><p class="muted">Approximate driving distance to CAIR SPA in Huntington Beach.</p></div><div class="city-grid">${CITIES.map(cityCard).join('')}</div></div></section>
<section class="sec" id="treatments"><div class="wrap"><div class="sec-head reveal"><div><span class="eyebrow">Treatments</span><h2>Care for face, skin, hair and body</h2></div><p>Every treatment has its own page with what to expect, downtime and answers to common questions.</p></div>${treatmentsBlock()}</div></section>
<section class="sec-sm"><div class="wrap">${oversightBand()}</div></section>
<section class="sec bg-white" id="faq"><div class="wrap">${faqBlock(faqs, { title: 'Questions from Orange County clients' })}</div></section>
<section class="sec"><div class="wrap">${visitBlock()}</div></section>`;
  return layout({ title: 'Wellness & Beauty Spa Serving Orange County, CA | CAIR SPA', description: 'CAIR SPA in Huntington Beach serves clients across Orange County. See the distance from your city. Free consultations; weekends by appointment.', canonical: '/orange-county-medical-spa', body, current: 'areas', schema: [faqSchema(faqs), crumbSchema([['Home', '/'], ['Areas we serve', '/orange-county-medical-spa']])] });
}

function contactPage() {
  const body = `
<section class="page-hero"><div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span>Contact</span></nav>
  <div class="page-hero-grid"><div><span class="eyebrow">Contact & booking</span><h1>Book your free consultation</h1><p class="lead">Call us, or send a request and our team will call you back to schedule. Consultations are free and there’s no obligation.</p>
    <dl class="info-list"><div><dt>Phone</dt><dd><a href="tel:${SITE.tel}">${SITE.phone}</a> <span class="muted">(main)</span><br><a href="tel:${SITE.cellTel}">${SITE.cell}</a> <span class="muted">(cell)</span></dd></div><div><dt>Email</dt><dd><a href="mailto:${SITE.email}">${SITE.email}</a></dd></div><div><dt>Address</dt><dd>${SITE.street}<br>${SITE.city}, ${SITE.region} ${SITE.zip}</dd></div><div><dt>Hours</dt><dd>Monday – Friday: 9:00 AM – 6:00 PM<br>Saturday – Sunday: By appointment</dd></div></dl></div>
  <div>${leadForm({ title: 'Request an appointment', note: 'We’ll call you to confirm a time that works.', source: 'Contact Page', full: true })}</div></div></div></section>
<section class="sec"><div class="wrap">${visitBlock()}</div></section>`;
  return layout({ title: 'Contact & Book | CAIR SPA Huntington Beach', description: 'Book a free consultation at CAIR SPA, 20951 Brookhurst St Ste 115, Huntington Beach. Call (949) 688-5898 or request a call back online.', canonical: '/contact/', body, current: 'contact', schema: [crumbSchema([['Home', '/'], ['Contact', '/contact/']])] });
}

function faqPage() {
  const sections = CATS.map((c) => `<div class="cat-block"><div class="cat-title"><h3>${esc(c.name)}</h3></div><div class="cards">${inCat(c.id).map((s) => `<a class="card" href="/services/${s.slug}#faq"><div class="card-body"><h3>${reg(s.name)}</h3><p>${reg(s.faqs[0].q)}</p><span class="link-arrow">${s.faqs.length} answers</span></div></a>`).join('')}</div></div>`).join('');
  const body = `
<section class="page-hero"><div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span>FAQ</span></nav><span class="eyebrow">FAQ</span><h1>Frequently asked questions</h1><p class="lead">Answers about consultations, pricing, downtime and each treatment at CAIR SPA in Huntington Beach.</p></div></section>
<section class="sec bg-white"><div class="wrap">${faqBlock(GENERAL_FAQS, { title: 'General questions' })}</div></section>
<section class="sec"><div class="wrap"><div class="sec-head"><div><span class="eyebrow">By treatment</span><h2>Treatment questions</h2></div><p>Each treatment page answers the most common questions about results, downtime, comfort and candidacy.</p></div>${sections}</div></section>`;
  return layout({ title: 'FAQ | CAIR SPA Wellness & Beauty Spa Huntington Beach', description: 'Answers to common questions about CAIR SPA in Huntington Beach: free consultations, pricing, downtime, hours and every treatment we offer.', canonical: '/faq/', body, current: 'faq', schema: [faqSchema(GENERAL_FAQS), crumbSchema([['Home', '/'], ['FAQ', '/faq/']])] });
}

// ---------- write ----------
const write = (rel, html) => { const p = path.join(ROOT, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, html); };
write('index.html', homePage());
write('services/index.html', servicesHub());
services.forEach((s) => write(`services/${s.slug}/index.html`, servicePage(s)));
write('about/index.html', aboutPage());
write('contact/index.html', contactPage());
write('faq/index.html', faqPage());
write('products/index.html', productsPage());
CITIES.forEach((c) => write(`${c.slug}/index.html`, cityPage(c)));
write('orange-county-medical-spa/index.html', countyPage());
fs.copyFileSync(path.join(SRC, 'cair.css'), path.join(ROOT, `assets/cair-${VERSION}.css`));
fs.copyFileSync(path.join(SRC, 'cair.js'), path.join(ROOT, `assets/cair-${VERSION}.js`));

// TypeSafe matcher function with the treatment catalog inlined
const catalog = services.map((s) => ({ slug: s.slug, name: s.name.replace(/®/g, ''), blurb: s.menuBlurb, goodFor: s.goodFor }));
write('api/match.mjs', fs.readFileSync(path.join(SRC, 'match.template.js'), 'utf8').replace('/*CATALOG*/[]', JSON.stringify(catalog, null, 1)));

// sitemap: new pages + existing area/legal pages
const urls = ['/', '/services/', ...services.map((s) => `/services/${s.slug}`), '/products/', '/about/', '/contact/', '/faq/', ...CITIES.map(cityHref), '/orange-county-medical-spa'];
const existing = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8').match(/<loc>[^<]+<\/loc>/g)?.map((l) => l.replace(/<\/?loc>/g, '').replace(ORIGIN, '')) || [];
const keep = existing.filter((u) => /-medical-spa$/.test(u) && !urls.includes(u));
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...urls, ...keep].map((u) => `  <url><loc>${ORIGIN}${u}</loc><lastmod>${TODAY}</lastmod></url>`).join('\n')}\n</urlset>\n`);
console.log(`Built ${services.length + 7 + CITIES.length} pages + sitemap (${urls.length + keep.length} URLs).`);
