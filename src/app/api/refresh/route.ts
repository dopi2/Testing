import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyRefreshToken, signAccessToken, signRefreshToken } from "@/lib/auth";
import { setAuthCookies } from "@/lib/cookies";
import { TokenPayload } from "@/types/auth";

export async function POST() {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;
  
  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  try {
    // Verify the refresh token
    const { id, email, role } = verifyRefreshToken(refreshToken) as TokenPayload;
    
    // Check if refresh token exists in database and is not expired
    const tokenRecord = await prisma.refreshToken.findFirst({
      where: { 
        token: refreshToken,
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: "Invalid or expired refresh token" }, { status: 401 });
    }

    // Generate new tokens
    const newAccessToken = signAccessToken({ 
      userId: tokenRecord.user.id, 
      email: tokenRecord.user.email, 
      role: tokenRecord.user.role 
    });
    
    const newRefreshToken = signRefreshToken({ 
      userId: tokenRecord.user.id 
    });

    // Delete old refresh token and save new one
    await prisma.$transaction([
      prisma.refreshToken.delete({
        where: { id: tokenRecord.id }
      }),
      prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: tokenRecord.user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      })
    ]);

    const response = NextResponse.json({ 
      accessToken: newAccessToken,
      user: {
        id: tokenRecord.user.id,
        email: tokenRecord.user.email,
        role: tokenRecord.user.role
      }
    });

    // Set new cookies
    setAuthCookies(response, newAccessToken, newRefreshToken);

    return response;

  } catch (err) {
    console.error("Refresh error:", err);
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
  }
}