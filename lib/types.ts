export type TransactionType = "income" | "expense";

export interface CategoryData {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
  isDefault: boolean;
}

export interface TransactionData {
  id: string;
  type: TransactionType;
  amount: number;
  memo: string;
  date: string;
  categoryId: string;
  category: CategoryData;
  createdAt: string;
}

export interface BudgetData {
  id: string;
  amount: number;
  month: string;
  categoryId: string;
  category: CategoryData;
}

export interface BudgetWithSpent extends BudgetData {
  spent: number;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  recentTransactions: TransactionData[];
  monthlyTrend: {
    labels: string[];
    income: number[];
    expense: number[];
  };
}

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  color: string;
  total: number;
  percentage: number;
}

export type PeriodFilter = "week" | "month" | "year";
