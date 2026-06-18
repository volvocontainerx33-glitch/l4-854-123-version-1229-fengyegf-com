(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');

  if (toggle && header) {
    toggle.addEventListener('click', function () {
      header.classList.toggle('open');
    });
  }

  document.querySelectorAll('form[action="search.html"]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        window.location.href = 'search.html';
      }
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filterRoot = document.querySelector('[data-local-filter]');
  if (filterRoot) {
    var keyword = filterRoot.querySelector('[data-filter-keyword]');
    var year = filterRoot.querySelector('[data-filter-year]');
    var type = filterRoot.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

    function applyLocalFilter() {
      var q = keyword ? keyword.value.trim().toLowerCase() : '';
      var y = year ? year.value : '';
      var t = type ? type.value : '';

      cards.forEach(function (card) {
        var blob = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();
        var ok = true;
        if (q && blob.indexOf(q) === -1) {
          ok = false;
        }
        if (y && card.getAttribute('data-year') !== y) {
          ok = false;
        }
        if (t && card.getAttribute('data-type').indexOf(t) === -1) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
      });
    }

    [keyword, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyLocalFilter);
        control.addEventListener('change', applyLocalFilter);
      }
    });
  }

  var searchMount = document.querySelector('[data-search-results]');
  if (searchMount && window.SITE_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = document.querySelector('[data-search-input]');
    if (input) {
      input.value = query;
    }

    function resultCard(movie) {
      return [
        '<article class="movie-card" data-title="', movie.title.replace(/"/g, '&quot;'), '">',
        '<a class="poster-wrap" href="', movie.url, '" aria-label="', movie.title.replace(/"/g, '&quot;'), '">',
        '<img src="', movie.cover, '" alt="', movie.title.replace(/"/g, '&quot;'), '" loading="lazy">',
        '<span class="poster-badge">', movie.year, '</span>',
        '<span class="poster-play">▶</span>',
        '</a>',
        '<div class="movie-card-body">',
        '<h3><a href="', movie.url, '">', movie.title, '</a></h3>',
        '<p class="movie-meta">', movie.region, ' · ', movie.type, '</p>',
        '<p class="movie-line">', movie.oneLine, '</p>',
        '<div class="card-tags"><span class="pill">', movie.genre, '</span></div>',
        '</div>',
        '</article>'
      ].join('');
    }

    var list = window.SITE_MOVIES;
    if (query) {
      var needle = query.toLowerCase();
      list = list.filter(function (movie) {
        return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine]
          .join(' ')
          .toLowerCase()
          .indexOf(needle) !== -1;
      });
    } else {
      list = list.slice(0, 80);
    }

    if (list.length) {
      searchMount.innerHTML = '<div class="grid">' + list.map(resultCard).join('') + '</div>';
    } else {
      searchMount.innerHTML = '<div class="empty-state">没有找到相关影片，请尝试其他关键词。</div>';
    }
  }
})();
