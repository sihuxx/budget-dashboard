import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const type = searchParams.get("type");

  const where: Record<string, unknown> = {};
  if (start && end) {
    where.date = { gte: new Date(start), lte: new Date(end) };
  }
  if (type) where.type = type;

  const transactions = await prisma.transaction.findMany({
    where,
    include: { category: true },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(
    transactions.map((t) => ({
      ...t,
      date: t.date.toISOString(),
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }))
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const transaction = await prisma.transaction.create({
    data: {
      type: body.type,
      amount: Number(body.amount),
      memo: body.memo || "",
      date: new Date(body.date),
      categoryId: body.categoryId,
    },
    include: { category: true },
  });

  return NextResponse.json({
    ...transaction,
    date: transaction.date.toISOString(),
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString(),
  });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const transaction = await prisma.transaction.update({
    where: { id: body.id },
    data: {
      type: body.type,
      amount: Number(body.amount),
      memo: body.memo || "",
      date: new Date(body.date),
      categoryId: body.categoryId,
    },
    include: { category: true },
  });

  return NextResponse.json({
    ...transaction,
    date: transaction.date.toISOString(),
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString(),
  });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.transaction.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
