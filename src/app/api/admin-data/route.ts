import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token) as any;
    
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get admin data from MongoDB
    const userCount = await prisma.user.count();
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { email: true, role: true, createdAt: true }
    });

    return NextResponse.json({ 
      secret: "Admin-only data from MongoDB",
      stats: {
        totalUsers: userCount,
        recentUsers
      }
    });

  } catch (err) {
    console.error("Admin data error:", err);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}