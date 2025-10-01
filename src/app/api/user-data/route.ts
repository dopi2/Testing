import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface TokenPayload {
  userId: string;
  role: string;
  email: string;
}

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = auth.split(" ")[1];
  try {
    const decoded = verifyAccessToken(token) as TokenPayload;

    // Get user-specific data from MongoDB
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true, 
        email: true, 
        role: true, 
        createdAt: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      secret: `Welcome ${user.email}! Your account was created on ${user.createdAt.toLocaleDateString()}`,
      userData: user
    });

  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}