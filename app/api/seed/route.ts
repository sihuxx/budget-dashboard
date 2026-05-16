import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_CATEGORIES } from "@/lib/default-categories";

export async function POST() {
  try {
    const existing = await prisma.category.count();
    if (existing > 0) {
      return NextResponse.json({ message: "Already seeded" });
    }
    for (const cat of DEFAULT_CATEGORIES) {
      await prisma.category.create({ data: { ...cat, isDefault: true } });
    }
    return NextResponse.json({ message: "Seeded successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
