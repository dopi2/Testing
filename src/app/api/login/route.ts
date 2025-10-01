import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signAccessToken, signRefreshToken, comparePassword } from "@/lib/auth";
import { setAuthCookies } from "@/lib/cookies";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Generate tokens
    const accessToken = signAccessToken({ 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    });
    
    const refreshToken = signRefreshToken({ 
      userId: user.id 
    });

    // Save refresh token to database
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    const response = NextResponse.json({
      message: "Login successful",
      accessToken,
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
    });

    // Set cookies
    setAuthCookies(response, accessToken, refreshToken);

    return response;

  } catch (err) {
    console.error("❌ Login error:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}