export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/",
    "/transactions",
    "/analysis",
    "/budget",
    "/api/categories/:path*",
    "/api/transactions/:path*",
    "/api/budgets/:path*",
    "/api/dashboard/:path*",
    "/api/analysis/:path*",
  ],
};
