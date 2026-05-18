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
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json({ error: "start and end required" }, { status: 400 });
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  const expenseByCategory = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      type: "expense",
      date: { gte: startDate, lte: endDate },
      userId: session.user.id,
    },
    _sum: { amount: true },
  });

  const incomeByCategory = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      type: "income",
      date: { gte: startDate, lte: endDate },
      userId: session.user.id,
    },
    _sum: { amount: true },
  });

  const categories = await prisma.category.findMany({
    where: {
      OR: [
        { isDefault: true, userId: null },
        { userId: session.user.id },
      ],
    },
  });
  const catMap = new Map(categories.map((c) => [c.id, c]));

  const totalExpense = expenseByCategory.reduce(
    (sum, e) => sum + (e._sum.amount || 0),
    0
  );

  const expenseSummary = expenseByCategory
    .map((e) => {
      const cat = catMap.get(e.categoryId);
      const total = e._sum.amount || 0;
      return {
        categoryId: e.categoryId,
        categoryName: cat?.name || "미분류",
        color: cat?.color || "#888",
        total,
        percentage: totalExpense > 0 ? Math.round((total / totalExpense) * 100) : 0,
      };
    })
    .sort((a, b) => b.total - a.total);

  const totalIncome = incomeByCategory.reduce(
    (sum, e) => sum + (e._sum.amount || 0),
    0
  );

  const incomeSummary = incomeByCategory
    .map((e) => {
      const cat = catMap.get(e.categoryId);
      const total = e._sum.amount || 0;
      return {
        categoryId: e.categoryId,
        categoryName: cat?.name || "미분류",
        color: cat?.color || "#888",
        total,
        percentage: totalIncome > 0 ? Math.round((total / totalIncome) * 100) : 0,
      };
    })
    .sort((a, b) => b.total - a.total);

  return NextResponse.json({
    expense: expenseSummary,
    income: incomeSummary,
    totalExpense,
    totalIncome,
  });
}
