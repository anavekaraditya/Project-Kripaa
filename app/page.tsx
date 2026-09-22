"use client";

import { FormEvent, useEffect, useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollVideo from "../components/ScrollVideo";

const imageScenes: Record<number, string> = {
  4: "/assets/04-hand-arrival.png", 5: "/assets/05-thumb-interaction.png",
  6: "/assets/06-hand-recedes.png", 8: "/assets/08-desk-ritual.png", 9: "/assets/09-waitlist-background.png",
};

const VIDEO_STORY_END = 0.88;
const WAITLIST_AT = 1;
const scenes = [
  { id: "opening", at: 0, title: <>When your mind<br />won’t <em>sit still.</em></>, body: "Give your hands something quieter to do." },
  { id: "about", at: 0.2, title: <>Your thumb wants<br /><em>something</em> to do.</>, body: "The half-second before you pick up the phone." },
  { id: "boundary", at: 0.3, title: <>Give that urge<br />a <em>place</em> to go.</>, body: "Nine beads. One slow loop." },
  { id: "how-it-works", at: 0.4, title: <>Hold still.<br />Let one thing <em>turn.</em></>, body: "Inner ring stays. Outer band moves." },
  { id: "arrival", at: 0.52, title: <>Start with what’s<br /><em>already</em> in your hand.</>, body: "Cool metal. One familiar point." },
  { id: "interaction", at: 0.62, title: <>One small turn.<br />That’s the <em>idea.</em></>, body: "Not another app. A motion you can feel." },
  { id: "recedes", at: 0.7, title: <>You can let go.<br />The rhythm <em>stays.</em></>, body: "It keeps turning whether you watch it or not." },
  { id: "breath", at: 0.76, title: <>Turn with the <em>inhale.</em><br />Turn with the exhale.</>, body: "No timer. No screen. Just this." },
  { id: "ritual", at: 0.84, title: <>Leave it where<br />the day <em>pauses.</em></>, body: "Between emails. Before you sit down to meditate." },
];
const foci = [...scenes.map(scene => scene.at), WAITLIST_AT];

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => { const query = matchMedia("(prefers-reduced-motion: reduce)"); const apply = () => setReduced(query.matches); apply(); query.addEventListener("change", apply); return () => query.removeEventListener("change", apply); }, []);
  return reduced;
}

function AudioIcon({ on }: { on: boolean }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4.5 9.4h2.3L11.2 5.8v12.4L6.8 14.6H4.5A1.5 1.5 0 0 1 3 13.1v-2.2a1.5 1.5 0 0 1 1.5-1.5Z" />
    {on
      ? <>
        <path d="M14.6 9.15a3.35 3.35 0 0 1 0 5.7" />
        <path d="M17.2 6.9a6.2 6.2 0 0 1 0 10.2" />
      </>
      : <path d="m15.1 9.1 5.2 5.8" />}
  </svg>;
}

export default function Home() {
  const story = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [canvasActive, setCanvasActive] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "sending" | "success" | "failed">("idle");
  const [audioOn, setAudioOn] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const trigger = ScrollTrigger.create({ trigger: story.current, start: "top top", end: "+=900%", pin: ".stage", scrub: reduced ? false : 0.5, anticipatePin: 1, onUpdate: self => setProgress(self.progress) });
    const observer = new IntersectionObserver(([entry]) => setCanvasActive(entry.isIntersecting), { threshold: 0.05 });
    if (story.current) observer.observe(story.current);
    return () => { trigger.kill(); observer.disconnect(); };
  }, [reduced]);

  useEffect(() => {
    const query = matchMedia("(max-width: 760px)");
    const apply = () => { setMobile(query.matches); if (query.matches) setVideoReady(false); };
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  useEffect(() => () => audio.current?.pause(), []);

  useEffect(() => {
    const player = audio.current;
    if (!player) return;
    // Keep the soundtrack atmospheric: 6% at entry, rising gently to 34%.
    player.volume = Math.min(0.34, 0.06 + progress * 0.28);
  }, [progress]);

  const scrollToScene = (index: number, behavior: ScrollBehavior = reduced ? "auto" : "smooth") => {
    if (!story.current) return;
    window.scrollTo({ top: story.current.offsetTop + window.innerHeight * 9 * foci[index], behavior });
  };
  const opacityAt = (focus: number, falloff = 8) => {
    const distance = Math.abs(progress - focus);
    return Math.max(0, Math.min(1, 1 - distance * falloff));
  };
  const sceneMotion = (focus: number): CSSProperties => {
    const i = foci.indexOf(focus);
    const prev = i <= 0 ? focus - 0.08 : foci[i - 1];
    const next = i >= foci.length - 1 ? focus + 0.08 : foci[i + 1];
    const isLast = i === foci.length - 1;
    let opacity = 0;
    if (isLast) {
      const appear = 0.87;
      opacity = progress <= appear ? 0 : progress >= appear + 0.05 ? 1 : (progress - appear) / 0.05;
    } else {
      const gap = Math.min(focus - prev, next - focus);
      const hold = gap * 0.38;
      const fade = gap * 0.52;
      const distance = Math.abs(progress - focus);
      opacity = distance <= hold ? 1 : distance >= fade ? 0 : (fade - distance) / (fade - hold);
    }
    return {
      opacity,
      "--scene-visibility": opacity,
      "--scene-shift": `${(1 - opacity) * 18}px`,
    } as CSSProperties;
  };
  const deskOpacity = Math.max(0, Math.min(1, (progress - 0.8) / 0.06));
  const waitlistVeil = Math.max(0, Math.min(0.5, (progress - 0.82) / 0.12 * 0.5));
  const videoOpacity = 1;
  const openingMotion = sceneMotion(scenes[0].at);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) { setStatus("error"); return; }
    setStatus("sending");
    try {
      const response = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      if (!response.ok) throw new Error("waitlist");
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("failed");
    }
  };
  const toggleAudio = async () => {
    const player = audio.current;
    if (!player) return;
    if (audioOn) {
      player.pause();
      setAudioOn(false);
      return;
    }
    try {
      await player.play();
      setAudioOn(true);
    } catch {
      setAudioOn(false);
    }
  };
  return <main className={videoReady ? "video-ready" : ""}>
    <audio ref={audio} loop preload="metadata" onPlay={() => setAudioOn(true)} onPause={() => setAudioOn(false)}>
      <source src="/audio/kripa-atmosphere.mp3" type="audio/mpeg" />
    </audio>
    <header className="site-header" aria-label="Primary navigation">
      <button className="wordmark" onClick={() => scrollToScene(0)} aria-label="Project Kripaa, start from the beginning">PROJECT KRIPAA</button>
      <nav><button type="button" className={`audio-toggle ${audioOn ? "is-active" : ""}`} onClick={toggleAudio} aria-pressed={audioOn} aria-label={audioOn ? "Turn ambient audio off" : "Turn ambient audio on"} title={audioOn ? "Audio on" : "Audio off"}><AudioIcon on={audioOn} /></button></nav>
    </header>
    <section ref={story} className="story" aria-label="Project Kripaa story">
      <div className="stage">
        <div className="atmosphere" aria-hidden="true"><span /><span /><span /><span /></div>
        <ScrollVideo progress={progress} enabled={!reduced && !mobile && canvasActive} opacity={videoOpacity} storyEnd={VIDEO_STORY_END} onReady={setVideoReady} />
        <div className="opening-ring" style={{ opacity: Math.max(0, 1 - progress / 0.16) }} aria-hidden="true" />
        {[4, 5, 6].map(index => <div key={index} className={`plate plate-${index}`} style={{ opacity: opacityAt(scenes[index].at, 9) }} aria-hidden="true" />)}
        <div className="plate plate-8" style={{ opacity: deskOpacity }} aria-hidden="true" />
        <div className="plate plate-9" style={{ opacity: Math.max(0, Math.min(1, (progress - 0.88) / 0.06)) }} aria-hidden="true" />
        <div className="waitlist-veil" style={{ opacity: waitlistVeil }} aria-hidden="true" />
        <div className="thumb-direction" style={{ opacity: opacityAt(scenes[5].at, 10) }} aria-hidden="true">↓</div>
        <div className="breath-rings" style={{ opacity: opacityAt(scenes[7].at, 10) }} aria-hidden="true"><i /><i /><i /></div>
        <p className="scroll-cue" style={openingMotion} aria-hidden={(openingMotion.opacity as number) < 0.02}><span>SCROLL</span><i aria-hidden="true" /></p>
        {scenes.map((scene, index) => {
          const motion = sceneMotion(scene.at);
          return <article className={`scene scene-${index}`} id={scene.id} key={scene.id} style={motion} aria-hidden={(motion.opacity as number) < 0.02}>
          {scene.title && <><h1>{scene.title}</h1>{scene.body && <p>{scene.body}</p>}</>}
        </article>;
        })}
        <section className="join-panel" id="join" style={{ ...sceneMotion(WAITLIST_AT), pointerEvents: progress > 0.87 ? "auto" : "none" }} aria-label="Join the waitlist">
          <p className="product-name">PROJECT KRIPAA</p><h2 className="waitlist-title">A ring for restless <em>hands.</em></h2>
          <p>Turn it when your thoughts start looping — at your desk, or as you sit down to meditate.</p>
          <form onSubmit={submit} noValidate><label className="sr-only" htmlFor="email">Email address</label><input id="email" type="email" placeholder="you@email.com" value={email} onChange={e => { setEmail(e.target.value); setStatus("idle"); }} disabled={status === "sending" || status === "success"} aria-invalid={status === "error"} aria-describedby="form-message" /><button type="submit" disabled={status === "sending" || status === "success"}>{status === "sending" ? "SAVING…" : status === "success" ? "YOU’RE IN" : "SAVE MY SPOT"}</button></form>
          <p id="form-message" className={`form-message ${status}`} role="status">{status === "error" ? "That doesn’t look like a full email yet. Try you@email.com." : status === "failed" ? "Couldn’t save that just now. Try again in a moment." : status === "success" ? "You’re on the list. We’ll write when the first rings are ready." : status === "sending" ? "Saving your spot…" : ""}</p>
          <footer><a href="#privacy">PRIVACY</a><span /> <a href="#instagram">INSTAGRAM</a></footer>
        </section>
      </div>
    </section>
  </main>;
}
