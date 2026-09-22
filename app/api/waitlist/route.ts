import { NextResponse } from "next/server";

const emailPattern = /^\S+@\S+\.\S+$/;

export async function POST(request: Request) {
  const webhook = process.env.WAITLIST_WEBHOOK_URL;
  if (!webhook) return NextResponse.json({ error: "unconfigured" }, { status: 503 });

  let email = "";
  try {
    const body = await request.json() as { email?: unknown };
    email = String(body.email ?? "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  if (!emailPattern.test(email)) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const response = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ email, source: "project-kripaa" }),
  });

  if (!response.ok) return NextResponse.json({ error: "upstream" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
