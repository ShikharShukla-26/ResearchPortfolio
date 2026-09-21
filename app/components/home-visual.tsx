'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const collageAlt =
  'A colorful, hand-painted illustration with textured brushstrokes blending the San Francisco skyline into the Des Moines skyline and rolling Iowa fields, representing life and journey over the years';

export function HomeVisual() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.load();
  }, []);

  function playVideo() {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    void video
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }

  function pauseVideo() {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    setIsPlaying(false);
  }

  return (
    <aside
      className={`home-visual${isPlaying ? ' home-visual-is-playing' : ''}`}
      onPointerEnter={playVideo}
      onPointerLeave={pauseVideo}
      tabIndex={0}
      onFocus={playVideo}
      onBlur={pauseVideo}
      aria-label="Illustration — hover to play motion"
    >
      <video
        ref={videoRef}
        className="home-visual-video"
        poster="/san-francisco-iowa-collage.webp"
        preload="auto"
        muted
        playsInline
        loop
        aria-hidden
      >
        <source
          src="/san-francisco-iowa-collage.mp4"
          type="video/mp4"
          media="(min-width: 1100px)"
        />
      </video>
      <Image
        src="/san-francisco-iowa-collage.webp"
        alt={collageAlt}
        fill
        className="home-visual-image"
        sizes="(min-width: 1100px) 36vw, 0px"
        priority
      />
    </aside>
  );
}
