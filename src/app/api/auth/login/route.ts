import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { appSettings } from "@/db/schema";
import { verifyPassword, createSession, getSessionCookieOptions } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: "请输入密码" }, { status: 400 });
    }

    const setting = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.key, "password_hash"))
      .limit(1);

    if (setting.length === 0) {
      return NextResponse.json(
        { error: "请先设置密码", needSetup: true },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, setting[0].value);
    if (!valid) {
      return NextResponse.json({ error: "密码错误" }, { status: 401 });
    }

    const token = await createSession();
    const cookieOpts = getSessionCookieOptions();

    const response = NextResponse.json({ success: true });
    response.cookies.set(cookieOpts.name, token, cookieOpts);
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "登录失败" }, { status: 500 });
  }
}
