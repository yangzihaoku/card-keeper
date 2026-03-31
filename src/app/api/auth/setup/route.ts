import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { appSettings } from "@/db/schema";
import { hashPassword, createSession, getSessionCookieOptions } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password || password.length < 4) {
      return NextResponse.json(
        { error: "密码至少 4 位" },
        { status: 400 }
      );
    }

    // Check if password already exists
    const existing = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.key, "password_hash"))
      .limit(1);

    const hash = await hashPassword(password);

    if (existing.length > 0) {
      await db
        .update(appSettings)
        .set({ value: hash, updatedAt: new Date() })
        .where(eq(appSettings.key, "password_hash"));
    } else {
      await db.insert(appSettings).values({
        key: "password_hash",
        value: hash,
      });
    }

    const token = await createSession();
    const cookieOpts = getSessionCookieOptions();

    const response = NextResponse.json({ success: true });
    response.cookies.set(cookieOpts.name, token, cookieOpts);
    return response;
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: "设置失败" }, { status: 500 });
  }
}
