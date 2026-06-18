(function () {
    var body = document.body;
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
            body.classList.toggle('menu-open');
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var nextButton = document.querySelector('[data-hero-next]');
        var prevButton = document.querySelector('[data-hero-prev]');
        var current = 0;
        var timer = null;

        if (!slides.length) {
            return;
        }

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function schedule() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                schedule();
            });
        });

        if (nextButton) {
            nextButton.addEventListener('click', function () {
                show(current + 1);
                schedule();
            });
        }

        if (prevButton) {
            prevButton.addEventListener('click', function () {
                show(current - 1);
                schedule();
            });
        }

        schedule();
    }

    function setupFilters() {
        var filterInput = document.querySelector('[data-filter-input]');
        var resultCount = document.querySelector('[data-result-count]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

        if (!filterInput || !cards.length) {
            return;
        }

        if (filterInput.hasAttribute('data-autofill-query')) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q') || '';
            filterInput.value = query;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            var query = normalize(filterInput.value);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-search'));
                var matched = !query || haystack.indexOf(query) !== -1;
                card.classList.toggle('is-filtered-out', !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (resultCount) {
                resultCount.textContent = visible + ' 部影片';
            }
        }

        filterInput.addEventListener('input', applyFilter);
        applyFilter();
    }

    setupHero();
    setupFilters();
}());
