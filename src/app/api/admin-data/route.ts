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
    if (decoded.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    
    // Get admin data from MongoDB
    const userCount = await prisma.user.count();
    
    return NextResponse.json({ 
      secret: "Admin-only data from MongoDB",
      stats: {
        totalUsers: userCount
      }
    });
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}