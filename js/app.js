(function () {
  document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"]').forEach(function (a) {
    var s = window.getComputedStyle(a);
    if (s.position === 'fixed' || s.position === 'absolute') {
      a.style.setProperty('display', 'none', 'important');
    }
  });
})();
(function () {
  function fillLoop(root) {
    var track = root.children[0];
    if (!track) return;
    var sets = track.querySelectorAll('.bb-loop-set');
    var a = sets[0];
    if (!a) return;
    if (!a.getAttribute('data-seed')) a.setAttribute('data-seed', a.innerHTML);
    var seed = a.getAttribute('data-seed');
    a.innerHTML = seed;
    var n = 0;
    while (a.offsetWidth < root.clientWidth + 40 && n < 16) {
      a.insertAdjacentHTML('beforeend', seed);
      n += 1;
    }
    var b = sets[1];
    if (!b) {
      b = a.cloneNode(true);
      b.removeAttribute('data-seed');
      track.appendChild(b);
    } else {
      b.innerHTML = a.innerHTML;
    }
    track.style.setProperty('--loop', a.offsetWidth + 'px');
  }
  function syncLoops() {
    document.querySelectorAll('.bb-seals, .bb-pills, .bb-marquee').forEach(fillLoop);
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncLoops);
  }
  syncLoops();
  window.addEventListener('load', syncLoops);
  window.addEventListener('resize', syncLoops);
})();
(function () {
  var box = document.getElementById('bbStats');
  if (!box) return;
  var els = box.querySelectorAll('[data-count]');
  var done = false;
  function fmt(n, el) {
    var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var useSep = el.getAttribute('data-sep') === '1';
    var val;
    if (dec > 0) {
      val = n.toFixed(dec);
    } else {
      val = Math.round(n).toString();
      if (useSep) val = val.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    return prefix + val + suffix;
  }
  function run() {
    if (done) return;
    done = true;
    var start = performance.now();
    var dur = 1600;
    function tick(now) {
      var t = Math.min(1, (now - start) / dur);
      var e = 1 - Math.pow(1 - t, 3);
      els.forEach(function (el) {
        var to = parseFloat(el.getAttribute('data-count') || '0');
        el.textContent = fmt(to * e, el);
      });
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          run();
          io.disconnect();
        }
      });
    }, { threshold: 0.35 });
    io.observe(box);
  } else {
    run();
  }
})();
(function () {
  var list = document.getElementById('lista');
  var nets = document.getElementById('bbNets');
  var hint = document.getElementById('bbNetsHint');
  if (!list) return;
  var cards = list.querySelectorAll('.bb-card');
  var groups = list.querySelectorAll('.bb-group');

  function money(n) {
    return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function apply(f) {
    document.querySelectorAll('#bbNets .bb-net').forEach(function (b) {
      b.classList.toggle('is-on', f && b.getAttribute('data-filter') === f);
    });
    if (hint) hint.hidden = !!f;
    var n = 0;
    cards.forEach(function (card) {
      var ok = !!f && card.getAttribute('data-platform') === f;
      if (ok && n < 40) {
        card.style.display = 'flex';
        n += 1;
      } else {
        card.style.display = 'none';
      }
    });
    groups.forEach(function (g) {
      var vis = 0;
      g.querySelectorAll('.bb-card').forEach(function (c) {
        if (c.style.display !== 'none') vis += 1;
      });
      g.style.display = vis ? 'grid' : 'none';
    });
  }

  function paintPrice(card, qty) {
    var priceEl = card.querySelector('.bb-price b');
    var small = card.querySelector('.bb-price small');
    if (!priceEl) return;
    var p1k = parseFloat(card.getAttribute('data-price-1k') || '0');
    priceEl.textContent = 'R$ ' + money(p1k * qty / 1000);
    if (small) small.textContent = 'por ' + qty + ' unid. · R$ ' + money(p1k) + '/1k';
  }

  function syncPrice(card, clamp) {
    var input = card.querySelector('.bb-qty input');
    if (!input) return;
    var min = parseInt(card.getAttribute('data-min') || '1', 10);
    var max = parseInt(card.getAttribute('data-max') || '1000000', 10);
    var raw = String(input.value || '').replace(/\D/g, '');
    if (!clamp && raw === '') return;
    var qty = parseInt(raw || String(min), 10);
    if (isNaN(qty)) qty = min;
    if (clamp) {
      qty = Math.max(min, Math.min(max, qty));
      input.value = String(qty);
    } else if (qty > max) {
      qty = max;
      input.value = String(qty);
    } else {
      input.value = raw;
    }
    paintPrice(card, qty);
  }

  if (nets) {
    nets.addEventListener('click', function (e) {
      var btn = e.target.closest('.bb-net');
      if (!btn) return;
      apply(btn.getAttribute('data-filter') || '');
      list.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
  apply('');

  list.addEventListener('click', function (e) {
    var btn = e.target.closest('.bb-qty__btn');
    if (!btn) return;
    var card = btn.closest('.bb-card');
    var input = card.querySelector('.bb-qty input');
    var dir = parseInt(btn.getAttribute('data-dir') || '0', 10);
    input.value = parseInt(String(input.value).replace(/\D/g, '') || '0', 10) + dir;
    syncPrice(card, true);
  });

  list.addEventListener('input', function (e) {
    var card = e.target.closest('.bb-card');
    if (card && e.target.matches('.bb-qty input')) syncPrice(card, false);
  });
  list.addEventListener('focusout', function (e) {
    var card = e.target.closest('.bb-card');
    if (card && e.target.matches('.bb-qty input')) syncPrice(card, true);
  });
})();
(function () {
  var pop = document.getElementById('bbPop');
  if (!pop) return;
  function close() {
    pop.hidden = true;
    document.body.style.overflow = '';
  }
  pop.addEventListener('click', function (e) {
    if (e.target.closest('[data-close]')) close();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !pop.hidden) close();
  });
})();
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = (a.getAttribute('href') || '').slice(1);
      if (!id) return;
      var el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
(function () {
  var panel = window.INICIO_PANEL || './';
  var signup = window.INICIO_SIGNUP || panel;
  document.querySelectorAll('[data-go="panel"]').forEach(function (a) {
    a.setAttribute('href', panel);
  });
  document.querySelectorAll('[data-go="signup"]').forEach(function (a) {
    a.setAttribute('href', signup);
  });
})();
