# Project Kripa

An immersive, zero-credit marketing site for a tactile meditation and grounding ring.

## Run locally

```bash
npm install
npm run dev
```

Build a production bundle with `npm run build`.

## Notes

- All scene copy and controls are live HTML.
- Desktop visual motion uses the supplied scroll-scrubbed video; phones use static image plates and lightweight fades.
- Scene 4→5 remains a deterministic CSS transition pending any separately approved generation.
- On capable desktop browsers, the user-supplied `kripa-scroll-story.mp4` is scrubbed directly by scroll position. It is silent and lazily loaded after the opening frame; mobile, reduced-motion, and load-failure states use the existing static/procedural fallback.
- Waitlist signup is intentionally client-only in this phase.
