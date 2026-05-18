import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");

  const where: Record<string, unknown> = { userId: session.user.id };
  if (month) where.month = month;

  const budgets = await prisma.budget.findMany({
    where,
    include: { category: true },
    orderBy: { category: { name: "asc" } },
  });

  if (month) {
    const startDate = new Date(`${month}-01T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const spending = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        type: "expense",
        date: { gte: startDate, lt: endDate },
        userId: session.user.id,
      },
      _sum: { amount: true },
    });

    const spendMap = new Map(
      spending.map((s) => [s.categoryId, s._sum.amount || 0])
    );

    const result = budgets.map((b) => ({
      ...b,
      spent: spendMap.get(b.categoryId) || 0,
    }));

    return NextResponse.json(result);
  }

  return NextResponse.json(budgets);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const budget = await prisma.budget.upsert({
    where: {
      categoryId_month_userId: {
        categoryId: body.categoryId,
        month: body.month,
        userId: session.user.id,
      },
    },
    update: { amount: Number(body.amount) },
    create: {
      categoryId: body.categoryId,
      month: body.month,
      amount: Number(body.amount),
      userId: session.user.id,
    },
    include: { category: true },
  });
  return NextResponse.json(budget);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.budget.delete({ where: { id, userId: session.user.id } });
  return NextResponse.json({ success: true });
}
