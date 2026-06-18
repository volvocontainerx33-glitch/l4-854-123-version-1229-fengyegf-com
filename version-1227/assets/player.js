(function () {
    function setMessage(text) {
        var message = document.querySelector('[data-player-message]');
        if (message) {
            message.textContent = text;
        }
    }

    function playVideo(button) {
        var source = button.getAttribute('data-src');
        var playerCard = button.closest('.player-card');
        var video = playerCard ? playerCard.querySelector('video') : document.querySelector('video');

        if (!video || !source) {
            setMessage('当前播放源暂时不可用。');
            return;
        }

        button.classList.add('is-hidden');
        setMessage('正在载入播放源，请稍候。');

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().then(function () {
                    setMessage('正在播放。');
                }).catch(function () {
                    setMessage('浏览器阻止了自动播放，请点击播放器继续。');
                });
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setMessage('播放载入遇到问题，请刷新页面或稍后再试。');
                    hls.destroy();
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', function () {
                video.play().then(function () {
                    setMessage('正在播放。');
                }).catch(function () {
                    setMessage('浏览器阻止了自动播放，请点击播放器继续。');
                });
            }, { once: true });
        } else {
            video.src = source;
            setMessage('当前浏览器不支持 HLS 播放，可尝试使用支持 HLS 的浏览器打开。');
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player-button]')).forEach(function (button) {
        button.addEventListener('click', function () {
            playVideo(button);
        });
    });
}());
