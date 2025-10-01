import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    // Check Authorization header
    const authHeader = req.headers.get("authorization");
    let token: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      // Fallback to cookie
      token = cookies().get("accessToken")?.value || null;
    }

    if (!token) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }

    const payload = verifyAccessToken(token) as any;
    
    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    return NextResponse.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err: any) {
    console.error("❌ Token verification failed:", err.message || err);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}