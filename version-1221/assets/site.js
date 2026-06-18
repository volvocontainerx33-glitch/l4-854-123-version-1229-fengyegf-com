(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.getElementById("mobilePanel");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var opened = panel.classList.toggle("open");
        toggle.setAttribute("aria-expanded", opened ? "true" : "false");
        toggle.textContent = opened ? "×" : "☰";
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      }

      function restart() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5000);
      }

      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          restart();
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          restart();
        });
      });

      restart();
    }

    var input = document.getElementById("searchInput");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-grid .movie-card"));
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    var activeFilter = "all";

    function applyFilter() {
      if (!cards.length) {
        return;
      }
      var keyword = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type")
        ].join(" ").toLowerCase();
        var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
        var filterMatch = activeFilter === "all" || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
        card.classList.toggle("is-hidden-card", !(keywordMatch && filterMatch));
      });
    }

    if (input && cards.length) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        input.value = q;
      }
      input.addEventListener("input", applyFilter);
      applyFilter();
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("active");
        });
        chip.classList.add("active");
        activeFilter = chip.getAttribute("data-filter") || "all";
        applyFilter();
      });
    });
  });

  window.initMoviePlayer = function (source, videoId, overlayId, buttonId) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var button = document.getElementById(buttonId);
    var loaded = false;
    var hls = null;

    if (!video || !overlay) {
      return;
    }

    function hideOverlay() {
      overlay.classList.add("is-hidden");
    }

    function attach() {
      if (loaded) {
        return;
      }
      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = source;
      }
    }

    function play() {
      hideOverlay();
      attach();
      video.play().catch(function () {});
    }

    overlay.addEventListener("click", play);

    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        play();
      });
    }

    video.addEventListener("play", hideOverlay);
    video.addEventListener("ended", function () {
      if (hls) {
        hls.stopLoad();
      }
    });
  };
})();
