(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector(".nav-toggle");
        var panel = document.querySelector(".mobile-panel");

        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-hero]").forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
            var prev = hero.querySelector(".hero-prev");
            var next = hero.querySelector(".hero-next");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === index);
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

            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    start();
                });
            }
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                    start();
                });
            });
            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            show(0);
            start();
        });

        document.querySelectorAll(".rail-section").forEach(function (section) {
            var rail = section.querySelector(".movie-rail");
            var prev = section.querySelector("[data-rail-prev]");
            var next = section.querySelector("[data-rail-next]");
            if (!rail) {
                return;
            }
            if (prev) {
                prev.addEventListener("click", function () {
                    rail.scrollBy({ left: -420, behavior: "smooth" });
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    rail.scrollBy({ left: 420, behavior: "smooth" });
                });
            }
        });

        function filterCards(value) {
            var term = (value || "").trim().toLowerCase();
            document.querySelectorAll(".filter-scope").forEach(function (scope) {
                scope.querySelectorAll("[data-search]").forEach(function (card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    card.classList.toggle("hidden-by-filter", term && text.indexOf(term) === -1);
                });
            });
        }

        var searchParams = new URLSearchParams(window.location.search);
        var initialQuery = searchParams.get("q") || "";
        document.querySelectorAll(".js-filter-input").forEach(function (input) {
            if (initialQuery && !input.value) {
                input.value = initialQuery;
            }
            input.addEventListener("input", function () {
                filterCards(input.value);
            });
        });
        if (initialQuery) {
            filterCards(initialQuery);
        }

        document.querySelectorAll(".filter-chip").forEach(function (chip) {
            chip.addEventListener("click", function () {
                var value = chip.getAttribute("data-filter") || chip.textContent;
                document.querySelectorAll(".js-filter-input").forEach(function (input) {
                    input.value = value;
                });
                filterCards(value);
            });
        });
    });
})();
