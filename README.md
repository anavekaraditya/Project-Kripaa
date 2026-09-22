# Project Kripaa

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
- Waitlist emails are saved to a Google Sheet through `/api/waitlist`. Add your Apps Script web app URL as `WAITLIST_WEBHOOK_URL` in `.env.local`.

## Google Sheet waitlist

1. Create a Google Sheet.
2. Extensions → Apps Script, paste `scripts/google-waitlist.gs`, and save.
3. Deploy → New deployment → Web app. Execute as you, access **Anyone**.
4. Copy the web app URL into `.env.local`:

```
WAITLIST_WEBHOOK_URL=https://script.google.com/macros/s/…/exec
```

5. Restart `npm run dev`. Signups append a timestamp and email to the first sheet.
