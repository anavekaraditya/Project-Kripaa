"use client";

import { FormEvent, useEffect, useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollVideo from "../components/ScrollVideo";

const imageScenes: Record<number, string> = {
  4: "/assets/04-hand-arrival.png", 5: "/assets/05-thumb-interaction.png",
  6: "/assets/06-hand-recedes.png", 8: "/assets/08-desk-ritual.png", 9: "/assets/09-waitlist-background.png",
};

const scenes = [
  { id: "opening", kicker: "PROJECT KRIPA", title: "", body: "" },
  { id: "about", title: <>Restlessness<br />looks for <em>somewhere</em> to go.</>, body: "" },
  { id: "boundary", title: <>Give it<br />a <em>boundary.</em></>, body: <>Nine points.<br />One loop.</> },
  { id: "how-it-works", title: <>An inner <em>anchor.</em><br />An outer <em>movement.</em></>, body: "" },
  { id: "arrival", title: <>Bring attention<br />to what is <em>here.</em></>, body: "A point of return." },
  { id: "interaction", title: <>One small movement<br />interrupts the pattern.</>, body: "Inner ring still. Outer band turns." },
  { id: "recedes", title: <>The hand recedes.<br />The movement remains.</>, body: "A rhythm to follow." },
  { id: "breath", title: <>Follow the movement.<br />Follow the breath.</>, body: "No screen. Just rhythm." },
  { id: "ritual", title: <>A quiet ritual,<br />within reach.</>, body: "Between tasks. Before meditation." },
];

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => { const query = matchMedia("(prefers-reduced-motion: reduce)"); const apply = () => setReduced(query.matches); apply(); query.addEventListener("change", apply); return () => query.removeEventListener("change", apply); }, []);
  return reduced;
}

export default function Home() {
  const story = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [canvasActive, setCanvasActive] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [audioOn, setAudioOn] = useState(false);
  const [started, setStarted] = useState(false);
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
    window.scrollTo({ top: story.current.offsetTop + (window.innerHeight * 9 * index / 9), behavior });
  };
  const visualOpacity = (index: number) => {
    const focus = index / 9;
    const distance = Math.abs(progress - focus);
    return Math.max(0, Math.min(1, 1 - distance * 7.5));
  };
  const sceneMotion = (index: number): CSSProperties => {
    const distance = Math.abs(progress - index / 9);
    // Keep a small visual pause between messages: the next line never fades in
    // while the previous one is still readable in the same position.
    const opacity = distance <= 0.028
      ? 1
      : distance >= 0.047
        ? 0
        : (0.047 - distance) / 0.019;
    return {
      opacity,
      "--scene-visibility": opacity,
      "--scene-shift": `${(1 - opacity) * 22}px`,
    } as CSSProperties;
  };
  const deskOpacity = () => {
    const enter = Math.max(0, Math.min(1, (progress - 0.72) / 0.1));
    const exit = 1 - Math.max(0, Math.min(1, (progress - 0.89) / 0.11));
    return enter * exit;
  };
  const videoOpacity = 1 - Math.max(0, Math.min(1, (progress - 0.72) / 0.1));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) { setStatus("error"); return; }
    setStatus("success");
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
  const beginExperience = async () => {
    setStarted(true);
    window.requestAnimationFrame(() => scrollToScene(1, "auto"));
    const player = audio.current;
    if (!player) return;
    player.volume = 0.06;
    try {
      await player.play();
      setAudioOn(true);
    } catch {
      setAudioOn(false);
    }
  };

  return <main className={videoReady ? "video-ready" : ""}>
    <audio ref={audio} loop autoPlay preload="metadata" onPlay={() => setAudioOn(true)} onPause={() => setAudioOn(false)}>
      <source src="/audio/kripa-atmosphere.mp3" type="audio/mpeg" />
    </audio>
    <header className="site-header" aria-label="Primary navigation">
      <button className="wordmark" onClick={() => scrollToScene(0)}>PROJECT KRIPA</button>
      <nav><button onClick={() => scrollToScene(1)}>ABOUT</button><button onClick={() => scrollToScene(3)}>HOW IT WORKS</button><button onClick={() => scrollToScene(9)}>JOIN</button><button type="button" className={`audio-toggle ${audioOn ? "is-active" : ""}`} onClick={toggleAudio} aria-pressed={audioOn} aria-label={audioOn ? "Turn ambient audio off" : "Turn ambient audio on"} title={audioOn ? "Audio on" : "Audio off"}>{audioOn ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6l-5 4H4Zm12.1 2a3.7 3.7 0 0 0-1.8-3.2v6.4a3.7 3.7 0 0 0 1.8-3.2Zm0-8.4v2.2a6.6 6.6 0 0 1 0 12.4v2.2a8.8 8.8 0 0 0 0-16.8Z" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6l-5 4H4Zm10.2 2 3.2 3.2 1.5-1.5-3.2-3.2 3.2-3.2-1.5-1.5-3.2 3.2-3.2-3.2-1.5 1.5 3.2 3.2-3.2 3.2 1.5 1.5 3.2-3.2Z" /></svg>}</button></nav>
    </header>
    {!started && <section className="begin-overlay" aria-label="Begin the Project Kripa experience"><p>PROJECT KRIPA</p><h1>A quieter way<br />to <em>return.</em></h1><button type="button" onClick={beginExperience}>BEGIN THE RITUAL</button></section>}
    <section ref={story} className="story" aria-label="Project Kripa story">
      <div className="stage">
        <div className="atmosphere" aria-hidden="true"><span /><span /><span /><span /></div>
        <ScrollVideo progress={progress} enabled={started && !reduced && !mobile && canvasActive} opacity={videoOpacity} onReady={setVideoReady} />
        <div className="mobile-ring" aria-hidden="true" />
        {[4, 5, 6, 8, 9].map(index => <div key={index} className={`plate plate-${index}`} style={{ opacity: index === 8 ? deskOpacity() : visualOpacity(index) }} aria-hidden="true" />)}
        <div className="thumb-direction" style={{ opacity: visualOpacity(5) }} aria-hidden="true">↓</div>
        <div className="breath-rings" style={{ opacity: visualOpacity(7) }} aria-hidden="true"><i /><i /><i /></div>
        {scenes.map((scene, index) => {
          const motion = sceneMotion(index);
          return <article className={`scene scene-${index}`} id={scene.id} key={scene.id} style={motion} aria-hidden={(motion.opacity as number) < 0.02}>
          {index === 0 && <p className="scroll-cue">SCROLL TO EXPLORE</p>}
          {scene.title && <><h1>{scene.title}</h1>{scene.body && <p>{scene.body}</p>}</>}
        </article>;
        })}
        <section className="join-panel" id="join" style={sceneMotion(9)} aria-label="Join the first release">
          <p className="product-name">PROJECT KRIPA</p><h2 className="waitlist-title">Be first to <em>wear Kripa.</em></h2>
          <p>A tactile ring for movement, grounding and meditation.</p>
          <form onSubmit={submit} noValidate><label className="sr-only" htmlFor="email">Email address</label><input id="email" type="email" placeholder="Email address" value={email} onChange={e => { setEmail(e.target.value); setStatus("idle"); }} aria-invalid={status === "error"} aria-describedby="form-message" /><button type="submit">JOIN THE FIRST RELEASE</button></form>
          <p id="form-message" className={`form-message ${status}`} role="status">{status === "error" ? "Enter a valid email address." : status === "success" ? "You’re on the list." : ""}</p>
          <footer><a href="#privacy">PRIVACY</a><span /> <a href="#instagram">INSTAGRAM</a></footer>
        </section>
      </div>
    </section>
    <section className="mobile-content" aria-label="Project Kripa details"><h2>Return to what is here.</h2><p>A tactile ring for intentional movement.</p><button onClick={() => scrollToScene(9)}>JOIN THE FIRST RELEASE</button></section>
  </main>;
}
