import { NextResponse } from "next/server";
import { createAdminSession, clearAdminSession, isValidAdminKey } from "@/lib/admin-auth";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const key = body?.key?.trim();

  if (!key) {
    return NextResponse.json(
      { ok: false, message: "أدخل مفتاح الإدارة أولاً." },
      { status: 400 }
    );
  }

  if (!isValidAdminKey(key)) {
    return NextResponse.json(
      { ok: false, message: "مفتاح الإدارة غير صحيح." },
      { status: 401 }
    );
  }

  await createAdminSession();

  return NextResponse.json({
    ok: true,
    message: "تم فتح لوحة الإدارة بنجاح."
  });
}

export async function DELETE() {
  await clearAdminSession();

  return NextResponse.json({
    ok: true,
    message: "تم تسجيل الخروج من لوحة الإدارة."
  });
}
