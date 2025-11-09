import React, { useRef, useEffect } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const VideoPlayer = ({ videoUrl, onProgress }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    const options = {
      autoplay: false,
      controls: true,
      responsive: true,
      fluid: true,
      sources: [{
        src: videoUrl,
        type: 'video/mp4'
      }]
    };

    const player = videojs(videoRef.current, options);
    playerRef.current = player;

    player.on('timeupdate', () => {
      const progress = (player.currentTime() / player.duration()) * 100;
      onProgress(progress);
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [videoUrl]);

  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js vjs-big-play-centered" />
    </div>
  );
};

export default VideoPlayer;
