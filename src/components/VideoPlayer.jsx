import { useState, useEffect, useRef, useCallback } from 'react';

let ytApiLoaded = false;
let ytApiCallbacks = [];

function loadYTApi() {
  if (ytApiLoaded) return Promise.resolve();
  if (window.YT?.Player) { ytApiLoaded = true; return Promise.resolve(); }

  return new Promise(resolve => {
    ytApiCallbacks.push(resolve);
    if (document.querySelector('script[src*="youtube.com/iframe_api"]')) return;

    window.onYouTubeIframeAPIReady = () => {
      ytApiLoaded = true;
      ytApiCallbacks.forEach(cb => cb());
      ytApiCallbacks = [];
    };

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  });
}

function extractVideoId(url) {
  const match = url.match(/(?:youtu\.be\/|v=|\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function VideoPlayer({ youtubeUrl, onComplete, lang }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const trackRef = useRef({ lastTime: 0, maxTime: 0 });
  const intervalRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ended, setEnded] = useState(false);
  const [volume, setVolume] = useState(100);

  const videoId = extractVideoId(youtubeUrl);

  useEffect(() => {
    if (!videoId) return;

    loadYTApi().then(() => {
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          controls: 0,
          modestbranding: 1,
          rel: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          playsinline: 1,
        },
        events: {
          onReady: (e) => {
            setDuration(e.target.getDuration());
          },
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.PLAYING) setPlaying(true);
            if (e.data === window.YT.PlayerState.PAUSED) setPlaying(false);
            if (e.data === window.YT.PlayerState.ENDED) {
              setPlaying(false);
              setEnded(true);
            }
          }
        }
      });

      // Anti-seek tracker
      intervalRef.current = setInterval(() => {
        if (!playerRef.current?.getCurrentTime) return;
        const t = playerRef.current.getCurrentTime();
        const track = trackRef.current;

        // If user seeked forward beyond what they've watched
        if (t > track.maxTime + 2) {
          playerRef.current.seekTo(track.maxTime, true);
          return;
        }

        track.lastTime = t;
        if (t > track.maxTime) track.maxTime = t;
        setCurrentTime(t);
      }, 1000);
    });

    return () => {
      clearInterval(intervalRef.current);
      if (playerRef.current?.destroy) playerRef.current.destroy();
    };
  }, [videoId]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (playing) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  };

  const handleVolume = (e) => {
    const v = parseInt(e.target.value);
    setVolume(v);
    if (playerRef.current?.setVolume) playerRef.current.setVolume(v);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="video-container">
      <div className="video-wrapper">
        <div ref={containerRef} className="video-embed" />
        {/* Overlay to block YouTube clickthrough */}
        <div className="video-overlay" onClick={togglePlay} />
      </div>

      <div className="video-controls">
        <button className="video-btn" onClick={togglePlay}>
          {playing ? '⏸' : '▶'}
        </button>

        <div className="video-progress-bar">
          <div className="video-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <span className="video-time">{formatTime(currentTime)} / {formatTime(duration)}</span>

        <input type="range" className="video-volume" min="0" max="100" value={volume}
          onChange={handleVolume} />
      </div>

      <button className="auth-btn primary video-continue" disabled={!ended} onClick={onComplete}>
        {ended
          ? (lang === 'hi' ? '✅ आगे बढ़ें' : '✅ Continue')
          : (lang === 'hi' ? `⏳ वीडियो देखें (${formatTime(duration - currentTime)} बाकी)` : `⏳ Watch video (${formatTime(duration - currentTime)} left)`)}
      </button>
    </div>
  );
}