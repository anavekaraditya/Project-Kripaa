"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  progress: number;
  enabled: boolean;
  opacity: number;
  storyEnd: number;
  onReady: (ready: boolean) => void;
};

export default function ScrollVideo({ progress, enabled, opacity, storyEnd, onReady }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const target = useRef(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (enabled) setLoaded(true);
  }, [enabled]);

  useEffect(() => {
    const element = video.current;
    if (!element || !loaded) return;
    const visualEnd = element.duration || 18.04;
    const span = Math.max(0.01, storyEnd);
    target.current = Math.min(visualEnd - 0.04, (Math.min(progress, span) / span) * visualEnd);
  }, [progress, loaded, storyEnd]);

  useEffect(() => {
    const element = video.current;
    if (!element || !loaded) return;
    // Mobile browsers sometimes need playback to begin once before they will
    // paint seeked frames. Warm the decoder, then pause so scroll owns time.
    if (!matchMedia("(max-width: 760px)").matches) return;
    const startDecoder = () => {
      void element.play().then(() => element.pause()).catch(() => undefined);
    };
    if (element.readyState >= 3) startDecoder();
    else element.addEventListener("canplay", startDecoder, { once: true });
    return () => {
      element.removeEventListener("canplay", startDecoder);
    };
  }, [loaded]);

  useEffect(() => {
    const element = video.current;
    if (!element || !loaded) return;
    let frame = 0;
    const sync = () => {
      if (!element.seeking && Math.abs(element.currentTime - target.current) > 1 / 48) element.currentTime = target.current;
      frame = requestAnimationFrame(sync);
    };
    frame = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(frame);
  }, [loaded]);

  return <div className={`story-video ${loaded ? "is-loaded" : ""}`} style={{ opacity: loaded ? opacity : 0 }} aria-hidden="true">
    {loaded && <video ref={video} muted playsInline preload="auto" poster="/assets/03-ring-mechanism.png" onLoadedData={() => onReady(true)} onError={() => onReady(false)}>
      <source src="/videos/kripa-scroll-story.mp4" type="video/mp4" />
    </video>}
  </div>;
}
