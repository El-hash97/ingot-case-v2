import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { pouringRequestSchema, submitPouring, PouringError } from "@/lib/pouring";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = pouringRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
  }

  try {
    const result = await submitPouring(session.userId, parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof PouringError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: "Gagal menyimpan log penuangan" }, { status: 500 });
  }
}
