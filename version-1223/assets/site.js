(function () {
  function all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function one(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[character];
    });
  }

  function initMenu() {
    var toggle = one('[data-menu-toggle]');
    var panel = one('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = one('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = all('[data-hero-slide]', hero);
    var dots = all('[data-hero-dot]', hero);
    var prev = one('[data-hero-prev]', hero);
    var next = one('[data-hero-next]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function go(step) {
      show(current + step);
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        go(1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        go(-1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        go(1);
        start();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initRails() {
    all('.rail-wrap').forEach(function (wrap) {
      var rail = one('[data-rail]', wrap);
      var left = one('[data-scroll-left]', wrap);
      var right = one('[data-scroll-right]', wrap);
      if (!rail) {
        return;
      }
      if (left) {
        left.addEventListener('click', function () {
          rail.scrollBy({ left: -420, behavior: 'smooth' });
        });
      }
      if (right) {
        right.addEventListener('click', function () {
          rail.scrollBy({ left: 420, behavior: 'smooth' });
        });
      }
    });
  }

  function initFilters() {
    all('[data-filter-input]').forEach(function (input) {
      var target = one(input.getAttribute('data-filter-target')) || document;
      var cards = all('[data-card]', target);
      input.addEventListener('input', function () {
        var query = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-region'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-year')
          ].join(' ').toLowerCase();
          card.style.display = haystack.indexOf(query) >= 0 ? '' : 'none';
        });
      });
    });
  }

  function buildSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 2).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<a class="movie-card" href="' + escapeHtml(movie.url) + '">' +
      '<span class="poster-frame"><img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"><em>' + escapeHtml(movie.year) + '</em></span>' +
      '<span class="card-body"><strong>' + escapeHtml(movie.title) + '</strong><small>' + escapeHtml(movie.oneLine) + '</small><span class="meta-row"><b>' + escapeHtml(movie.region) + '</b>' + tags + '</span></span>' +
      '</a>';
  }

  function initSearchPage() {
    var form = one('[data-search-page-form]');
    var input = one('[data-search-page-input]');
    var grid = one('[data-search-grid]');
    var count = one('[data-search-count]');
    var movies = window.SEARCH_MOVIES || [];
    if (!form || !input || !grid) {
      return;
    }

    function render(query) {
      var keyword = query.trim().toLowerCase();
      if (!keyword) {
        grid.innerHTML = '';
        if (count) {
          count.textContent = '输入关键词后开始搜索';
        }
        return;
      }
      var result = movies.filter(function (movie) {
        return [movie.title, movie.region, movie.type, movie.genre, movie.year, movie.oneLine, (movie.tags || []).join(' ')]
          .join(' ')
          .toLowerCase()
          .indexOf(keyword) >= 0;
      });
      grid.innerHTML = result.map(buildSearchCard).join('');
      if (count) {
        count.textContent = result.length ? '找到 ' + result.length + ' 部相关影片' : '未找到相关影片';
      }
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;
    render(initial);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = input.value.trim();
      var url = value ? './search.html?q=' + encodeURIComponent(value) : './search.html';
      window.history.replaceState(null, '', url);
      render(value);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initRails();
    initFilters();
    initSearchPage();
  });
})();

function initMoviePlayer(source) {
  document.addEventListener('DOMContentLoaded', function () {
    var root = document.querySelector('[data-player]');
    if (!root) {
      return;
    }
    var video = root.querySelector('video');
    var overlay = root.querySelector('[data-play-overlay]');
    var button = root.querySelector('[data-play-button]');
    var errorBox = root.querySelector('[data-player-error]');
    var prepared = false;
    var hls = null;

    function showError() {
      if (errorBox) {
        errorBox.hidden = false;
      }
    }

    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showError();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        showError();
      }
    }

    function play() {
      prepare();
      root.classList.add('player-started');
      video.controls = true;
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          root.classList.remove('player-started');
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }
    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        play();
      });
    }
    video.addEventListener('click', function () {
      if (!video.controls) {
        play();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
}