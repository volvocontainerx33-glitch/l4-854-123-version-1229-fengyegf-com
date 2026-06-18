import { H as Hls } from './hls-dru42stk.js';

export function initMoviePlayer(options) {
  var video = document.getElementById(options.videoId);
  var trigger = document.getElementById(options.triggerId);
  var src = options.src;
  var ready = false;
  var hls = null;

  if (!video || !trigger || !src) {
    return;
  }

  function attach() {
    if (ready) {
      return;
    }
    ready = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(src);
      hls.attachMedia(video);
    } else {
      video.src = src;
    }
  }

  function play() {
    attach();
    video.controls = true;
    trigger.classList.add('is-hidden');
    var attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {
        trigger.classList.remove('is-hidden');
      });
    }
  }

  trigger.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });
  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
