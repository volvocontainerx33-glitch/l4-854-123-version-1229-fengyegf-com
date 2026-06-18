(function() {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function toggleMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function() {
            menu.classList.toggle("is-open");
        });
    }

    function backTop() {
        var button = document.querySelector("[data-back-top]");
        if (!button) {
            return;
        }
        function sync() {
            if (window.scrollY > 360) {
                button.classList.add("is-visible");
            } else {
                button.classList.remove("is-visible");
            }
        }
        window.addEventListener("scroll", sync, { passive: true });
        button.addEventListener("click", function() {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
        sync();
    }

    function heroSlider() {
        var root = document.querySelector("[data-hero-slider]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function() {
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
            prev.addEventListener("click", function() {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function() {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function(dot, i) {
            dot.addEventListener("click", function() {
                show(i);
                start();
            });
        });
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function cardFilter() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-card-filter]"));
        if (!inputs.length) {
            return;
        }
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var empty = document.querySelector("[data-filter-empty]");

        function apply() {
            var terms = inputs.map(function(input) {
                return (input.value || "").trim().toLowerCase();
            }).filter(Boolean);

            var visible = 0;
            cards.forEach(function(card) {
                var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                var ok = terms.every(function(term) {
                    return haystack.indexOf(term) !== -1;
                });
                card.style.display = ok ? "" : "none";
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        inputs.forEach(function(input) {
            input.addEventListener("input", apply);
            input.addEventListener("change", apply);
        });

        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q && inputs[0] && !inputs[0].value) {
            inputs[0].value = q;
        }
        apply();
    }

    function initMoviePlayer(streamUrl) {
        var video = document.querySelector("[data-player-video]");
        var overlay = document.querySelector("[data-player-overlay]");
        if (!video || !overlay || !streamUrl) {
            return;
        }

        var hls = null;
        var attached = false;

        function reveal() {
            overlay.classList.add("is-hidden");
            video.controls = true;
        }

        function playVideo() {
            reveal();
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function() {
                    overlay.classList.remove("is-hidden");
                });
            }
        }

        function attachAndPlay() {
            if (attached) {
                playVideo();
                return;
            }
            attached = true;

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
                    playVideo();
                });
                hls.on(window.Hls.Events.ERROR, function(event, data) {
                    if (!data || !data.fatal || !hls) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                        return;
                    }
                    hls.destroy();
                    hls = null;
                });
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                playVideo();
            }
        }

        overlay.addEventListener("click", attachAndPlay);
        video.addEventListener("click", function() {
            if (!attached) {
                attachAndPlay();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;

    ready(function() {
        toggleMenu();
        backTop();
        heroSlider();
        cardFilter();
    });
})();
