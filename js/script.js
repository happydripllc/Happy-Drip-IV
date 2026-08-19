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
  const input = e.target.querySelector('input[type="email"]');
  const btn = e.target.querySelector('button');
  const email = input.value.trim();
  if (!email) return;

  // Submit silently to Zoho Forms in the background
  const data = new FormData();
  data.append('Email', email);
  data.append('zf_referrer_name', '');
  data.append('zf_redirect_url', '');
  data.append('zc_gad', '');
  fetch(
    'https://forms.zohopublic.com/infohappy1/form/StayConnected/formperma/CnV-rVDAJ7cUmgqBjpeG7tcmroxIvxns62sKUM_ypTU/htmlRecords/submit',
    { method: 'POST', body: data, mode: 'no-cors' }
  ).catch(() => {}); // opaque response — data is delivered, ignore the response

  // Update UI
  btn.textContent = '✓';
  btn.style.background = '#2ecc71';
  input.value = '';
  input.placeholder = 'Thanks! You\'re on the list.';
  setTimeout(() => {
    btn.textContent = 'Go';
    btn.style.background = '';
    input.placeholder = 'your@email.com';
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
