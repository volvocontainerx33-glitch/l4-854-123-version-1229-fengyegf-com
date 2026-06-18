(function () {
  var root = document.body ? document.body.getAttribute('data-root') || '' : '';

  function selectAll(selector, context) {
    return Array.prototype.slice.call((context || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMobileMenu() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    if (!panel) {
      return;
    }

    var keywordInput = panel.querySelector('[data-filter-keyword]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var genreSelect = panel.querySelector('[data-filter-genre]');
    var resetButton = panel.querySelector('[data-filter-reset]');
    var status = panel.querySelector('[data-filter-status]');
    var cards = selectAll('.movie-card[data-title]');

    function cardText(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-category'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
    }

    function applyFilter() {
      var keyword = normalize(keywordInput && keywordInput.value);
      var year = normalize(yearSelect && yearSelect.value);
      var genre = normalize(genreSelect && genreSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var matchesKeyword = !keyword || cardText(card).indexOf(keyword) !== -1;
        var matchesYear = !year || normalize(card.getAttribute('data-year')) === year;
        var matchesGenre = !genre || normalize(card.getAttribute('data-genre')).indexOf(genre) !== -1;
        var isVisible = matchesKeyword && matchesYear && matchesGenre;
        card.style.display = isVisible ? '' : 'none';
        if (isVisible) {
          visible += 1;
        }
      });

      if (status) {
        status.textContent = '当前页面筛选结果：' + visible + ' 部影片';
      }

      selectAll('[data-empty-state]').forEach(function (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      });
    }

    [keywordInput, yearSelect, genreSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (keywordInput) {
          keywordInput.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        if (genreSelect) {
          genreSelect.value = '';
        }
        applyFilter();
      });
    }
  }

  function movieCardHtml(movie) {
    return [
      '<a class="movie-card" href="' + root + movie.url + '" data-title="' + escapeHtml(movie.title) + '">',
      '  <div class="poster-wrap">',
      '    <img src="' + root + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="year-badge">' + escapeHtml(movie.year) + '</span>',
      '    <span class="play-badge">▶</span>',
      '  </div>',
      '  <div class="movie-card-body">',
      '    <h3>' + escapeHtml(movie.title) + '</h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="card-tags">',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.category) + '</span>',
      '      <span>' + escapeHtml(movie.genre) + '</span>',
      '    </div>',
      '  </div>',
      '</a>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var categorySelect = document.querySelector('[data-search-category]');
    var yearSelect = document.querySelector('[data-search-year]');
    var results = document.querySelector('[data-search-results]');
    var status = document.querySelector('[data-search-status]');

    if (!form || !input || !results || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    input.value = query;

    function runSearch() {
      var keyword = normalize(input.value);
      var category = normalize(categorySelect && categorySelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var matches = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.category,
          movie.genre,
          movie.tags,
          movie.oneLine
        ].join(' '));
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesCategory = !category || normalize(movie.category) === category;
        var matchesYear = !year || normalize(movie.year) === year;
        return matchesKeyword && matchesCategory && matchesYear;
      }).slice(0, 120);

      results.innerHTML = matches.map(movieCardHtml).join('');
      if (status) {
        status.textContent = matches.length ? '找到 ' + matches.length + ' 条相关影片' : '没有找到匹配影片，请更换关键词。';
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var nextParams = new URLSearchParams(window.location.search);
      nextParams.set('q', input.value.trim());
      window.history.replaceState(null, '', '?' + nextParams.toString());
      runSearch();
    });

    [input, categorySelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', runSearch);
        control.addEventListener('change', runSearch);
      }
    });

    runSearch();
  }

  function initPlayer() {
    selectAll('.video-shell').forEach(function (shell) {
      var video = shell.querySelector('video[data-hls-src]');
      var button = shell.querySelector('[data-play-button]');
      if (!video || !button) {
        return;
      }

      function loadAndPlay() {
        var source = video.getAttribute('data-hls-src');
        if (!source) {
          return;
        }

        button.classList.add('is-hidden');

        if (video.getAttribute('data-loaded') !== 'true') {
          video.setAttribute('data-loaded', 'true');

          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
            video._hls = hls;
          } else {
            video.src = source;
          }
        }

        video.play().catch(function () {
          button.classList.remove('is-hidden');
        });
      }

      button.addEventListener('click', function (event) {
        event.preventDefault();
        loadAndPlay();
      });

      shell.addEventListener('click', function (event) {
        if (event.target === video || event.target.closest('button')) {
          return;
        }
        loadAndPlay();
      });

      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initFilters();
    initSearchPage();
    initPlayer();
  });
})();
