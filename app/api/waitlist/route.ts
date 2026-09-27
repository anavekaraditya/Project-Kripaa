import { NextResponse } from "next/server";

const emailPattern = /^\S+@\S+\.\S+$/;

export async function POST(request: Request) {
  const webhook = process.env.WAITLIST_WEBHOOK_URL?.trim();
  if (!webhook) return NextResponse.json({ error: "unconfigured" }, { status: 503 });

  let email = "";
  try {
    const body = await request.json() as { email?: unknown };
    email = String(body.email ?? "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  if (!emailPattern.test(email)) return NextResponse.json({ error: "invalid" }, { status: 400 });

  let response: Response;
  try {
    response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ email, source: "project-kripaa" }),
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });
  } catch (error) {
    console.error("Waitlist webhook request failed", error);
    return NextResponse.json({ error: "webhook-unreachable" }, { status: 502 });
  }

  if (!response.ok) {
    console.error("Waitlist webhook rejected request", response.status, response.statusText);
    return NextResponse.json({ error: "upstream", status: response.status }, { status: 502 });
  }

  let result: { status?: string } = {};
  try {
    result = await response.json() as { status?: string };
  } catch {
    // Preserve a successful signup even if the webhook response has no JSON body.
  }
  return NextResponse.json({ ok: true, status: result.status });
}
