(function () {
  function syncNavLogos() {
    document.querySelectorAll('[data-logo-light][data-logo-dark]').forEach(function (img) {
      var preto = img.getAttribute('data-logo-light');
      var branco = img.getAttribute('data-logo-dark');
      if (!preto || !branco) return;
      var whiteLogo = !!(
        img.closest('.bb-nav') ||
        img.closest('.bb-foot') ||
        img.closest('.lp-footer') ||
        img.closest('.lp-logo--footer')
      );
      var next = whiteLogo ? branco : preto;
      if (img.getAttribute('src') !== next) img.setAttribute('src', next);
    });
  }
  window.syncNavLogos = syncNavLogos;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncNavLogos);
  } else {
    syncNavLogos();
  }
})();
