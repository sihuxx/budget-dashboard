import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json({ error: "start and end required" }, { status: 400 });
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  const transactions = await prisma.transaction.findMany({
    where: { 
      date: { gte: startDate, lte: endDate },
      userId: session.user.id,
    },
    include: { category: true },
    orderBy: { date: "desc" },
  });

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const now = new Date();
  const monthlyLabels: string[] = [];
  const monthlyIncome: number[] = [];
  const monthlyExpense: number[] = [];

  for (let i = 5; i >= 0; i--) {
    const m = subMonths(now, i);
    const mStart = startOfMonth(m);
    const mEnd = endOfMonth(m);
    monthlyLabels.push(format(m, "M월"));

    const mTx = await prisma.transaction.findMany({
      where: { 
        date: { gte: mStart, lte: mEnd },
        userId: session.user.id,
      },
    });

    monthlyIncome.push(
      mTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)
    );
    monthlyExpense.push(
      mTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)
    );
  }

  return NextResponse.json({
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    recentTransactions: transactions.slice(0, 8).map((t) => ({
      ...t,
      date: t.date.toISOString(),
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })),
    monthlyTrend: {
      labels: monthlyLabels,
      income: monthlyIncome,
      expense: monthlyExpense,
    },
  });
}
