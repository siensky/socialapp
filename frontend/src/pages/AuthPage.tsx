import { useState, useRef } from "react";
import type { User } from "../App";

const API = "http://localhost:3000";

type Props = { onLogin: (token: string, user: User) => void };
type Mode = "login" | "register";

function PasswordInput({ name, autoComplete }: { name: string; autoComplete: string }) {
  const [value, setValue] = useState("");
  const [showLast, setShowLast] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const next = e.target.value;
    if (next.length > value.length) {
      setShowLast(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setShowLast(false), 800);
    } else {
      setShowLast(false);
    }
    setValue(next);
  };

  const masked =
    value.length === 0
      ? ""
      : showLast
        ? "•".repeat(value.length - 1) + value[value.length - 1]
        : "•".repeat(value.length);

  return (
    <div className="relative">
      <input
        name={name}
        autoComplete={autoComplete}
        required
        value={value}
        onChange={handleChange}
        placeholder="••••••••"
        className="w-full px-0 py-2 bg-transparent text-sm outline-none border-b tracking-widest"
        style={{ borderColor: "oklch(0.22 0 0)", color: "transparent", caretColor: "#fff" }}
      />
      <div
        className="absolute inset-0 py-2 text-sm pointer-events-none tracking-widest overflow-hidden whitespace-pre"
        style={{ color: "#fff" }}
      >
        {masked || <span style={{ color: "oklch(0.56 0 0)" }}>••••••••</span>}
      </div>
    </div>
  );
}

export default function AuthPage({ onLogin }: Props) {
  const [mode, setMode] = useState<Mode>("login");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const data = new FormData(e.currentTarget);
    try {
      if (mode === "login") {
        const res = await fetch(`${API}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: data.get("username"), password: data.get("password") }),
        });
        const json = await res.json();
        if (!res.ok) { setError(json.message ?? "Something went wrong"); return; }
        onLogin(json.token, json.user);
      } else {
        const res = await fetch(`${API}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: data.get("username"),
            display_name: data.get("display_name"),
            email: data.get("email"),
            phone: data.get("phone"),
            birthdate: data.get("birthdate"),
            password: data.get("password"),
            visibility,
          }),
        });
        const json = await res.json();
        if (!res.ok) { setError(json.message ?? "Something went wrong"); return; }
        onLogin(json.token, json.user);
      }
    } catch {
      setError("Network error — is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, name: string, type = "text", placeholder = "", extra?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] tracking-[0.15em] uppercase font-mono" style={{ color: "oklch(0.62 0 0)" }}>
        {label}
      </label>
      <input
        name={name} type={type} placeholder={placeholder} required
        className="w-full px-0 py-2 bg-transparent text-sm outline-none border-b transition-colors"
        style={{ borderColor: "oklch(0.22 0 0)", color: "#fff" }}
        {...extra}
      />
    </div>
  );

  return (
    <div
      className="flex items-start justify-center min-h-screen p-6 pt-16"
      style={{ background: "oklch(0.07 0 0)" }}
    >
      <div className="w-full max-w-xs flex flex-col gap-8">
        {/* Logo */}
        <div className="flex flex-col gap-2">
          <h1
            className="text-4xl font-black font-mono logo-glow"
            style={{ letterSpacing: "-0.04em", color: "#fff" }}
          >
            SOCLR
          </h1>
          <p className="text-xs tracking-widest font-mono uppercase" style={{ color: "oklch(0.56 0 0)" }}>
            {mode === "login" ? "Sign in to continue" : "Create your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {field("Username", "username", "text", "yourname", { autoComplete: "username", minLength: 3 })}

          {mode === "register" && (
            <>
              {field("Display name", "display_name", "text", "Your Name")}
              {field("Email", "email", "email", "you@example.com", { autoComplete: "email" })}
              {field("Phone", "phone", "tel", "+46701234567")}
              {field("Birthday", "birthdate", "date", "")}

              {/* Visibility toggle */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] tracking-[0.15em] uppercase font-mono" style={{ color: "oklch(0.62 0 0)" }}>
                  Account type
                </label>
                <div className="flex gap-2">
                  {(["public", "private"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setVisibility(v)}
                      className="flex-1 py-2 text-xs font-bold tracking-widest uppercase font-mono rounded-sm transition-all"
                      style={
                        visibility === v
                          ? { background: "var(--accent)", color: "#000", boxShadow: "var(--accent-glow)" }
                          : { background: "transparent", color: "oklch(0.62 0 0)", border: "1px solid oklch(0.22 0 0)" }
                      }
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] tracking-[0.15em] uppercase font-mono" style={{ color: "oklch(0.62 0 0)" }}>
              Password
            </label>
            <PasswordInput name="password" autoComplete={mode === "login" ? "current-password" : "new-password"} />
          </div>

          {error && <p className="text-sm" style={{ color: "#ff3b5c" }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-3 text-xs font-bold tracking-[0.15em] uppercase font-mono transition-all disabled:opacity-40"
            style={{
              background: "var(--accent)",
              color: "#000",
              boxShadow: loading ? "none" : "var(--accent-glow)",
            }}
          >
            {loading ? "…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="text-center text-xs font-mono" style={{ color: "oklch(0.56 0 0)" }}>
          {mode === "login" ? "No account? " : "Already have one? "}
          <button
            type="button"
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            className="underline underline-offset-4"
            style={{ color: "var(--accent)" }}
          >
            {mode === "login" ? "Register" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
