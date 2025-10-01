import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { TokenPayload } from "@/types/auth";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token) as TokenPayload;

    // Get user-specific data from MongoDB
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true, 
        email: true, 
        role: true, 
        createdAt: true,
        updatedAt: true 
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      secret: `Welcome ${user.email}! Your account was created on ${user.createdAt.toLocaleDateString()}`,
      userData: user
    });

  } catch (err) {
    console.error("User data error:", err);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}