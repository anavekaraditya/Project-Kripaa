"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  progress: number;
  enabled: boolean;
  opacity: number;
  onReady: (ready: boolean) => void;
};

export default function ScrollVideo({ progress, enabled, opacity, onReady }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const target = useRef(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (enabled && progress > 0.01) setLoaded(true);
  }, [enabled, progress]);

  useEffect(() => {
    const element = video.current;
    if (!element || !loaded) return;
    // End on the meditative hand/ripple moment, before the desk enters.
    const visualEnd = Math.min(14.6, element.duration || 14.6);
    target.current = Math.min(visualEnd - 0.04, (Math.min(progress, 0.72) / 0.72) * visualEnd);
  }, [progress, loaded]);

  useEffect(() => {
    const element = video.current;
    if (!element || !loaded) return;
    let frame = 0;
    const sync = () => {
      if (Math.abs(element.currentTime - target.current) > 1 / 48) element.currentTime = target.current;
      frame = requestAnimationFrame(sync);
    };
    frame = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(frame);
  }, [loaded]);

  return <div className={`story-video ${loaded ? "is-loaded" : ""}`} style={{ opacity: loaded ? opacity : 0 }} aria-hidden="true">
    {loaded && <video ref={video} muted playsInline preload="auto" onLoadedData={() => onReady(true)} onError={() => onReady(false)}>
      <source src="/videos/kripa-scroll-story.mp4" type="video/mp4" />
    </video>}
  </div>;
}
