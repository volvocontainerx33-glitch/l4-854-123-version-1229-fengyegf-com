document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var carousel = document.querySelector("[data-hero-carousel]");

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    restart();
  }

  var filterBar = document.querySelector("[data-filter-bar]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-grid] [data-title]"));

  if (filterBar && cards.length) {
    var input = filterBar.querySelector("[data-search-input]");
    var yearSelect = filterBar.querySelector("[data-year-filter]");
    var regionSelect = filterBar.querySelector("[data-region-filter]");
    var years = [];
    var regions = [];

    cards.forEach(function (card) {
      var year = card.getAttribute("data-year") || "";
      var region = card.getAttribute("data-region") || "";

      if (year && years.indexOf(year) === -1) {
        years.push(year);
      }

      if (region && regions.indexOf(region) === -1) {
        regions.push(region);
      }
    });

    years.sort().reverse();
    regions.sort();

    years.forEach(function (year) {
      var option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    });

    regions.forEach(function (region) {
      var option = document.createElement("option");
      option.value = region;
      option.textContent = region;
      regionSelect.appendChild(option);
    });

    function applyFilters() {
      var keyword = input.value.trim().toLowerCase();
      var year = yearSelect.value;
      var region = regionSelect.value;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();

        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !year || card.getAttribute("data-year") === year;
        var matchRegion = !region || card.getAttribute("data-region") === region;

        card.classList.toggle("is-hidden", !(matchKeyword && matchYear && matchRegion));
      });
    }

    input.addEventListener("input", applyFilters);
    yearSelect.addEventListener("change", applyFilters);
    regionSelect.addEventListener("change", applyFilters);

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");

    if (q) {
      input.value = q;
      applyFilters();
    }
  }
});
