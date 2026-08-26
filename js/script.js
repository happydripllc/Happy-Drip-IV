// ============================================================
// Happy Drip IV & Wellness — Main JS
// ============================================================

// Footer year
document.getElementById('footerYear').textContent = new Date().getFullYear();

// ---- Mobile hamburger ----
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobileNav = document.getElementById('mobileNav');
if (hamburgerBtn && mobileNav) {
  hamburgerBtn.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    hamburgerBtn.setAttribute('aria-expanded', isOpen);
  });
  // Close mobile nav when a link is clicked
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

// ---- FAQ accordion ----
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const answer = item.querySelector('.faq-a');
    const isOpen = btn.getAttribute('aria-expanded') === 'true';

    // Close all others
    document.querySelectorAll('.faq-item').forEach(other => {
      if (other !== item) {
        other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
        other.querySelector('.faq-a').hidden = true;
        other.classList.remove('open');
      }
    });

    btn.setAttribute('aria-expanded', !isOpen);
    answer.hidden = isOpen;
    item.classList.toggle('open', !isOpen);
  });
});

// ---- Email subscribe ----
function handleSubscribe(e) {
  e.preventDefault();
  var form  = e.target;
  var input = form.querySelector('input[type="email"]');
  var btn   = form.querySelector('button');
  var email = input.value.trim();
  if (!email) return;

  // Ensure persistent iframe exists (Zoho redirect loads here invisibly)
  if (!document.querySelector('iframe[name="zohoNewsletterFrame"]')) {
    var fr = document.createElement('iframe');
    fr.name = 'zohoNewsletterFrame';
    fr.style.display = 'none';
    fr.setAttribute('aria-hidden', 'true');
    document.body.appendChild(fr);
  }

  // Wire form to Zoho every time (idempotent — safe to repeat)
  form.action        = 'https://forms.zohopublic.com/infohappy1/form/StayConnected/formperma/CnV-rVDAJ7cUmgqBjpeG7tcmroxIvxns62sKUM_ypTU/htmlRecords/submit';
  form.method        = 'POST';
  form.enctype       = 'multipart/form-data';
  form.acceptCharset = 'UTF-8';
  form.target        = 'zohoNewsletterFrame';
  input.name         = 'Email';

  ['zf_referrer_name', 'zf_redirect_url', 'zc_gad'].forEach(function (n) {
    if (!form.querySelector('[name="' + n + '"]')) {
      var h = document.createElement('input');
      h.type = 'hidden'; h.name = n; h.value = '';
      form.appendChild(h);
    }
  });

  // Submit FIRST (browser captures form data at this moment), then update UI
  form.submit();

  btn.textContent    = '✓';
  btn.style.background = '#2ecc71';
  input.value        = '';
  input.placeholder  = "You're on the list!";
  setTimeout(function () {
    btn.textContent    = 'Go';
    btn.style.background = '';
    input.placeholder  = 'your@email.com';
  }, 4000);
}
window.handleSubscribe = handleSubscribe;

// ---- Cookie consent ----
(function () {
  if (localStorage.getItem('cookieAccepted')) return;
  const notice = document.createElement('div');
  notice.className = 'cookie-notice';
  notice.setAttribute('role', 'alert');
  notice.innerHTML = `
    <p>This website uses cookies to enhance your experience and analyze site traffic.
       By continuing, you agree to our <a href="/privacy-policy.html">Privacy Policy</a>.</p>
    <button class="cookie-btn" id="acceptCookies">Accept</button>
  `;
  document.body.appendChild(notice);
  // Animate in after short delay (above the bottom bar)
  notice.style.bottom = '44px';
  setTimeout(() => notice.classList.add('show'), 300);
  document.getElementById('acceptCookies').addEventListener('click', () => {
    localStorage.setItem('cookieAccepted', '1');
    notice.classList.remove('show');
    setTimeout(() => notice.remove(), 400);
  });
})();

// ---- Smooth scroll for anchor links ----
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const headerH = document.querySelector('.site-header')?.offsetHeight || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ---- Active nav link on scroll ----
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-30% 0px -60% 0px' });
sections.forEach(s => observer.observe(s));

// ---- Animate cards on scroll ----
const animateObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, i * 60);
      animateObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card, .price-card, .wl-card, .testimonial-card, .payment-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.45s ease, transform 0.45s ease, box-shadow 0.25s ease, border-color 0.25s ease';
  animateObserver.observe(el);
});

// ---- Reviews Carousel ----
(function () {
  const track = document.getElementById('reviewsTrack');
  if (!track) return;

  let current  = 0;
  let autoTimer = null;

  function cards() { return track.querySelectorAll('.review-card'); }

  function buildDots() {
    const container = document.getElementById('reviewsDots');
    if (!container) return;
    container.innerHTML = '';
    cards().forEach((_, i) => {
      const btn = document.createElement('button');
      btn.className = 'reviews-dot' + (i === 0 ? ' active' : '');
      btn.setAttribute('aria-label', 'Review ' + (i + 1));
      btn.addEventListener('click', () => { stopAuto(); goTo(i); startAuto(); });
      container.appendChild(btn);
    });
  }

  function updateDots() {
    document.querySelectorAll('.reviews-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function goTo(idx) {
    const all = cards();
    if (!all.length) return;
    current = ((idx % all.length) + all.length) % all.length;
    all[current].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    updateDots();
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => goTo(current + 1), 5500);
  }
  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  buildDots();
  startAuto();

  document.getElementById('reviewsPrev')?.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
  document.getElementById('reviewsNext')?.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });
  track.addEventListener('mouseenter', stopAuto);
  track.addEventListener('mouseleave', startAuto);

  // ---- Helpers ----
  function escHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function initials(name) {
    return (name || '').split(' ').map(w => w[0] || '').slice(0, 2).join('').toUpperCase() || '★';
  }

  function starStr(n) {
    var s = Math.max(0, Math.min(5, n));
    return '★'.repeat(s) + '☆'.repeat(5 - s);
  }

  function buildCard(r) {
    var text = r.text.length > 220 ? r.text.slice(0, 220).trimEnd() + '…' : r.text;
    return '<div class="review-card">' +
      '<div class="review-card-header">' +
        '<div class="review-avatar">' + escHtml(initials(r.authorName)) + '</div>' +
        '<div>' +
          '<div class="review-author-name">' + escHtml(r.authorName) + '</div>' +
          '<div class="review-author-time">' + escHtml(r.relativeTime) + '</div>' +
        '</div>' +
        '<div class="review-google-badge" aria-label="Google review">G</div>' +
      '</div>' +
      '<div class="review-stars" aria-label="' + r.rating + ' stars">' + starStr(r.rating) + '</div>' +
      '<p class="review-text">“' + escHtml(text) + '”</p>' +
    '</div>';
  }

  // ---- Fetch live reviews from Pages Function ----
  fetch('/api/reviews')
    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
    .then(function (data) {
      if (!data.reviews || data.reviews.length === 0) return;

      track.innerHTML = data.reviews.map(buildCard).join('');
      current = 0;
      buildDots();
      stopAuto(); startAuto();

      if (data.rating) {
        var scoreEl = document.getElementById('reviewScore');
        if (scoreEl) scoreEl.textContent = parseFloat(data.rating).toFixed(1);
      }
      if (data.totalRatings) {
        var countEl = document.getElementById('reviewCount');
        if (countEl) countEl.textContent = data.totalRatings + ' Google reviews';
      }

      var attr = document.getElementById('reviewsAttribution');
      if (attr) attr.hidden = false;
    })
    .catch(function () { /* static fallback stays */ });
})();
