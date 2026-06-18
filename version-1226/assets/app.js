document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('menu-open', open);
    });
  }

  document.querySelectorAll('.hero-carousel').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var previous = carousel.querySelector('.hero-prev');
    var next = carousel.querySelector('.hero-next');
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(active - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('.filter-panel').forEach(function (panel) {
    var search = panel.querySelector('.category-search');
    var year = panel.querySelector('.year-filter');
    var type = panel.querySelector('.type-filter');
    var grid = panel.parentElement.querySelector('.category-movie-grid');

    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var empty = document.createElement('div');
    empty.className = 'empty-state is-hidden';
    empty.textContent = '暂无匹配内容';
    grid.appendChild(empty);

    function apply() {
      var keyword = search ? search.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';
      var selectedType = type ? type.value : '';
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-tags') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-type') || ''
        ].join(' ').toLowerCase();
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
        var matchType = !selectedType || card.getAttribute('data-type') === selectedType;
        var visible = matchKeyword && matchYear && matchType;
        card.classList.toggle('is-hidden', !visible);
        if (visible) {
          shown += 1;
        }
      });

      empty.classList.toggle('is-hidden', shown !== 0);
    }

    [search, year, type].forEach(function (element) {
      if (element) {
        element.addEventListener('input', apply);
        element.addEventListener('change', apply);
      }
    });
  });

  var results = document.getElementById('global-search-results');
  var globalInput = document.querySelector('[data-global-search]');

  if (results && typeof SITE_MOVIES !== 'undefined') {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();

    if (globalInput) {
      globalInput.value = query;
    }

    function card(movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return '<article class="movie-card">' +
        '<a href="' + escapeHtml(movie.url) + '" class="movie-link">' +
          '<div class="poster-wrap">' +
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<span class="year-badge">' + escapeHtml(movie.year) + '</span>' +
          '</div>' +
          '<div class="movie-body">' +
            '<h3>' + escapeHtml(movie.title) + '</h3>' +
            '<p>' + escapeHtml(movie.oneLine) + '</p>' +
            '<div class="meta-row"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
            '<div class="tag-row">' + tags + '</div>' +
          '</div>' +
        '</a>' +
      '</article>';
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"]/g, function (character) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[character];
      });
    }

    function render(value) {
      var key = value.trim().toLowerCase();
      var list = SITE_MOVIES.filter(function (movie) {
        if (!key) {
          return movie.hot;
        }
        return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags.join(' '), movie.oneLine]
          .join(' ')
          .toLowerCase()
          .indexOf(key) !== -1;
      }).slice(0, 96);

      results.innerHTML = list.length ? list.map(card).join('') : '<div class="empty-state">暂无匹配内容</div>';
    }

    render(query);
  }

  document.querySelectorAll('.player-card').forEach(function (player) {
    var video = player.querySelector('.video-node');
    var overlay = player.querySelector('.player-overlay');
    var hls = null;
    var ready = false;

    function begin() {
      if (!video) {
        return;
      }

      var stream = player.getAttribute('data-stream');

      if (!stream) {
        return;
      }

      player.classList.add('is-playing');

      if (ready) {
        video.play().catch(function () {});
        return;
      }

      ready = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          }
        });
      } else {
        video.src = stream;
        video.addEventListener('loadedmetadata', function () {
          video.play().catch(function () {});
        }, { once: true });
        video.load();
      }
    }

    if (overlay) {
      overlay.addEventListener('click', begin);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!ready || video.paused) {
          begin();
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
    }

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
});
