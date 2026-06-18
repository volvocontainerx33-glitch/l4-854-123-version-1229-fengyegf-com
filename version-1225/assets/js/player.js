document.addEventListener("DOMContentLoaded", function () {
  var shells = Array.prototype.slice.call(document.querySelectorAll("[data-player-shell]"));

  shells.forEach(function (shell) {
    var video = shell.querySelector("video");
    var button = shell.querySelector("[data-player-start]");
    var stream = video ? video.getAttribute("data-stream") : "";
    var loaded = false;

    function prepare() {
      if (!video || !stream || loaded) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });

        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      loaded = true;
    }

    function playVideo() {
      prepare();
      shell.classList.add("is-playing");

      var attempt = video.play();

      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          shell.classList.remove("is-playing");
        });
      }
    }

    if (button) {
      button.addEventListener("click", playVideo);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!loaded) {
          playVideo();
        }
      });

      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
    }
  });
});
