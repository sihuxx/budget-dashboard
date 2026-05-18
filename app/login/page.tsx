"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("로그인 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl italic text-accent mb-2">
            Cashbook
          </h1>
          <p className="text-sm text-tx-tertiary">나의 가계부</p>
        </div>

        <div className="bg-bg-secondary rounded-2xl border border-border p-8">
          <h2 className="text-xl font-medium mb-6 text-center">로그인</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-tx-secondary mb-1.5 block">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 text-tx-primary placeholder:text-tx-tertiary"
                required
              />
            </div>

            <div>
              <label className="text-xs text-tx-secondary mb-1.5 block">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 text-tx-primary placeholder:text-tx-tertiary"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-white py-3 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-tx-secondary">
              계정이 없으신가요?{" "}
              <Link
                href="/register"
                className="text-accent hover:underline font-medium"
              >
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
