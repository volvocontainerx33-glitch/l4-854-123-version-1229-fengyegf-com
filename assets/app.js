(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var button = $('[data-menu-toggle]');
    var panel = $('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
      button.setAttribute('aria-expanded', panel.classList.contains('is-open') ? 'true' : 'false');
    });
  }

  function setupHero() {
    $$('[data-hero-slider]').forEach(function (slider) {
      var slides = $$('.hero-slide', slider);
      var dots = $$('.hero-dot', slider);
      var prev = $('[data-hero-prev]', slider);
      var next = $('[data-hero-next]', slider);
      var index = 0;
      var timer = null;
      if (!slides.length) {
        return;
      }
      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === index);
        });
      }
      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }
      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
          start();
        });
      });
      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          start();
        });
      }
      slider.addEventListener('mouseenter', stop);
      slider.addEventListener('mouseleave', start);
      slider.addEventListener('focusin', stop);
      slider.addEventListener('focusout', start);
      show(0);
      start();
    });
  }

  function setupSearchForms() {
    $$('.site-search').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = $('input', form);
        var value = input ? input.value.trim() : '';
        if (value) {
          window.location.href = './search.html?q=' + encodeURIComponent(value);
        } else {
          window.location.href = './search.html';
        }
      });
    });
  }

  function setupCardFilters() {
    $$('[data-filter-area]').forEach(function (area) {
      var keyword = $('[data-filter-keyword]', area);
      var year = $('[data-filter-year]', area);
      var type = $('[data-filter-type]', area);
      var grid = $('[data-card-grid]', area);
      if (!grid) {
        return;
      }
      var cards = $$('.movie-card, .movie-row', grid);
      function apply() {
        var q = normalize(keyword && keyword.value);
        var y = normalize(year && year.value);
        var t = normalize(type && type.value);
        cards.forEach(function (card) {
          var hay = normalize(card.textContent + ' ' + (card.getAttribute('data-search') || ''));
          var ok = true;
          if (q && hay.indexOf(q) === -1) {
            ok = false;
          }
          if (y && normalize(card.getAttribute('data-year')) !== y) {
            ok = false;
          }
          if (t && normalize(card.getAttribute('data-type')) !== t) {
            ok = false;
          }
          card.style.display = ok ? '' : 'none';
        });
      }
      [keyword, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function cardHtml(item) {
    return [
      '<a class="movie-card" href="' + item.file + '" data-year="' + item.year + '" data-type="' + item.type + '" data-search="' + escapeAttr([item.title, item.region, item.genre, item.tags].join(' ')) + '">',
      '<div class="poster-wrap">',
      '<img src="' + item.cover + '" alt="' + escapeAttr(item.title) + '">',
      '<span class="badge">' + escapeHtml(item.year || '') + '</span>',
      '<span class="poster-shade"><span class="play-dot">▶</span></span>',
      '</div>',
      '<div class="card-body">',
      '<h3 class="line-clamp-2">' + escapeHtml(item.title) + '</h3>',
      '<p class="line-clamp-2">' + escapeHtml(item.oneLine || '') + '</p>',
      '<div class="card-meta"><span class="card-tag">' + escapeHtml(item.category || item.type || '') + '</span><span>' + escapeHtml(item.region || '') + '</span></div>',
      '</div>',
      '</a>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (match) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[match];
    });
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
  }

  function setupSearchPage() {
    var input = $('#searchPageInput');
    var results = $('#searchResults');
    if (!input || !results || !window.MOVIE_SEARCH_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;
    function render() {
      var q = normalize(input.value);
      var data = window.MOVIE_SEARCH_DATA || [];
      var hits = q ? data.filter(function (item) {
        var hay = normalize([item.title, item.region, item.type, item.genre, item.tags, item.oneLine, item.year].join(' '));
        return hay.indexOf(q) !== -1;
      }).slice(0, 120) : data.slice(0, 40);
      results.innerHTML = hits.map(cardHtml).join('');
    }
    input.addEventListener('input', render);
    $('#searchPageForm').addEventListener('submit', function (event) {
      event.preventDefault();
      render();
    });
    render();
  }

  function setupBackTop() {
    var button = $('[data-back-top]');
    if (!button) {
      return;
    }
    function toggle() {
      button.classList.toggle('is-visible', window.pageYOffset > 360);
    }
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', toggle, { passive: true });
    toggle();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupSearchForms();
    setupCardFilters();
    setupSearchPage();
    setupBackTop();
  });
})();
