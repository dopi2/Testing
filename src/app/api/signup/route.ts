import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signAccessToken, signRefreshToken, hashPassword } from "@/lib/auth";
import { setAuthCookies } from "@/lib/cookies";

export async function POST(req: Request) {
  try {
    const { email, password, role = 'user' } = await req.json();

    // Check if user exists
    const existing = await prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: { 
        email, 
        password: hashedPassword, 
        role 
      },
    });

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
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });

    // Set cookies
    setAuthCookies(response, accessToken, refreshToken);

    return response;

  } catch (err) {
    console.error("❌ Signup error:", err);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}