import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "auth_token";

export async function POST() {
  try {
    const cookieStore = await cookies();

    cookieStore.delete(AUTH_COOKIE_NAME);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
