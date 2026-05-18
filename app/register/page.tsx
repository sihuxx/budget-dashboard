"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "회원가입 중 오류가 발생했습니다");
        setLoading(false);
        return;
      }

      // 회원가입 성공 후 자동 로그인
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("로그인 중 오류가 발생했습니다");
        setLoading(false);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("회원가입 중 오류가 발생했습니다");
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
          <h2 className="text-xl font-medium mb-6 text-center">회원가입</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-tx-secondary mb-1.5 block">
                이름 (선택)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 text-tx-primary placeholder:text-tx-tertiary"
              />
            </div>

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
                placeholder="8자 이상"
                minLength={8}
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
              {loading ? "가입 중..." : "회원가입"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-tx-secondary">
              이미 계정이 있으신가요?{" "}
              <Link
                href="/login"
                className="text-accent hover:underline font-medium"
              >
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
