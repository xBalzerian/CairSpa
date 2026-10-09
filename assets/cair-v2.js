(function () {
  var LEADS_URL = 'https://base44.app/api/apps/69b7cae883aa8d618e49d211/functions/submitForm';

  // Sticky header shadow
  var header = document.querySelector('.site-header');
  function onScroll() { if (header) header.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Desktop dropdowns: click/keyboard support (hover handled in CSS)
  document.querySelectorAll('.menu > li > button').forEach(function (btn) {
    var li = btn.parentElement;
    btn.addEventListener('click', function () {
      var open = !li.classList.contains('open');
      document.querySelectorAll('.menu > li.open').forEach(function (o) { o.classList.remove('open'); o.querySelector('button').setAttribute('aria-expanded', 'false'); });
      li.classList.toggle('open', open); btn.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.menu')) document.querySelectorAll('.menu > li.open').forEach(function (o) { o.classList.remove('open'); o.querySelector('button').setAttribute('aria-expanded', 'false'); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.menu > li.open').forEach(function (o) { o.classList.remove('open'); });
    closeDrawer();
  });

  // Mobile drawer
  var drawer = document.getElementById('drawer');
  function openDrawer() { drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }
  function closeDrawer() { if (!drawer) return; drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }
  document.querySelectorAll('[data-open-drawer]').forEach(function (b) { b.addEventListener('click', openDrawer); });
  document.querySelectorAll('[data-close-drawer]').forEach(function (b) { b.addEventListener('click', closeDrawer); });
  if (drawer) drawer.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeDrawer); });

  // Lead forms -> Base44 (same endpoint as the previous site)
  document.querySelectorAll('form[data-lead]').forEach(function (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type=submit]'), label = btn.textContent;
      var get = function (n) { var el = form.elements[n]; return el ? el.value.trim() : ''; };
      btn.disabled = true; btn.textContent = 'Sending…';
      try {
        var res = await fetch(LEADS_URL, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'lead', name: get('name'), email: get('email'), phone: get('phone'), service: get('service'), service_interest: get('service'), message: get('message'), form_type: form.getAttribute('data-lead') })
        });
        if (!res.ok) throw new Error(res.status);
        form.reset();
        btn.textContent = 'Thank you! We’ll call you shortly.';
        if (window.gtag) window.gtag('event', 'generate_lead', { form: form.getAttribute('data-lead') });
      } catch (err) {
        btn.disabled = false; btn.textContent = label;
        alert('Sorry, something went wrong. Please call us at (949) 688-5898.');
      }
    });
  });

  // Concern matcher (TypeSafe via /api/match, keyword fallback)
  var mForm = document.getElementById('matcher-form');
  if (mForm) {
    var catalog = window.CAIR_CATALOG || [];
    var out = document.getElementById('matcher-results');
    var input = mForm.elements.concern;
    document.querySelectorAll('[data-example]').forEach(function (b) {
      b.addEventListener('click', function () { input.value = b.getAttribute('data-example'); input.focus(); });
    });
    var bySlug = {}; catalog.forEach(function (s) { bySlug[s.slug] = s; });
    function render(slugs, opts) {
      opts = opts || {};
      var html = '';
      if (opts.medical) html += '<p class="notice">Some of what you describe may need a medical evaluation first. Please call us at <a href="tel:+19496885898"><b>(949) 688-5898</b></a> and our team will guide you, or see your doctor for anything urgent.</p>';
      slugs.filter(function (s) { return bySlug[s]; }).slice(0, 3).forEach(function (s, i) {
        var t = bySlug[s];
        html += '<a class="match" href="/services/' + t.slug + '"><img src="' + t.img + '" alt="" loading="lazy" width="72" height="72"><span><b>' + t.name + '</b><small>' + t.blurb + '</small></span><span class="tag">' + (i === 0 ? 'Best match' : 'Also consider') + '</span></a>';
      });
      if (!slugs.length || opts.unsure) html += '<p class="notice">Every face is different. A free consultation is the best way to find the right plan for you.</p>';
      html += '<a class="btn btn-primary" href="#book" style="margin-top:6px">Book a free consultation</a>';
      out.innerHTML = html;
    }
    function keywordMatch(text) {
      var words = text.toLowerCase().match(/[a-z]+/g) || [];
      return catalog.map(function (s) {
        var hay = s.keywords; var score = 0;
        words.forEach(function (w) { if (w.length > 3 && hay.indexOf(w) > -1) score++; });
        return [s.slug, score];
      }).filter(function (x) { return x[1] > 0; }).sort(function (a, b) { return b[1] - a[1]; }).map(function (x) { return x[0]; });
    }
    mForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      var text = input.value.trim(); if (text.length < 3) return;
      var btn = mForm.querySelector('button[type=submit]'); btn.disabled = true; btn.textContent = 'Finding your match…';
      try {
        var res = await fetch('/api/match', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ concern: text.slice(0, 500) }) });
        if (!res.ok) throw new Error(res.status);
        var data = await res.json();
        render(data.matches || [], { medical: data.medical, unsure: data.unsure });
      } catch (err) {
        render(keywordMatch(text), { unsure: true });
      }
      btn.disabled = false; btn.textContent = 'Find my treatment';
    });
  }

  // Reveal on scroll
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else { document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); }); }
})();
