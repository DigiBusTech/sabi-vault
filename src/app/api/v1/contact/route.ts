import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name is too short.").max(120),
  email: z.string().trim().email("A valid email address is required.").max(200),
  organisation: z.string().trim().max(160).optional().default(""),
  topic: z.enum(["general", "enterprise", "government", "notary", "support"]),
  message: z.string().trim().min(10, "Please include a short message.").max(4000),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  // Delivery adapter point: wire an email/CRM provider (Resend, Postmark, etc.) here
  // before public launch. Until then the enquiry is logged server-side.
  console.log("[Contact] New enquiry", {
    name: parsed.data.name,
    email: parsed.data.email,
    organisation: parsed.data.organisation,
    topic: parsed.data.topic,
    messageLength: parsed.data.message.length,
    receivedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true }, { status: 202 });
}
