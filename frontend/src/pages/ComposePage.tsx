import { useState, useRef } from "react";
import type { Auth, Page } from "../App";

const API = "http://localhost:3000";

type Props = { auth: Auth; goTo: (page: Page) => void };

export default function ComposePage({ auth, goTo }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const authHeader = { Authorization: `Bearer ${auth.token}` };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch(`${API}/create`, {
        method: "POST",
        headers: authHeader,
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message ?? "Failed to post");
        return;
      }
      formRef.current?.reset();
      setPreview(null);
      goTo("feed");
    } catch {
      setError("Network error");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen" style={{ background: "oklch(0.07 0 0)" }}>
      <header
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid oklch(0.14 0 0)" }}
      >
        <button
          onClick={() => goTo("feed")}
          className="text-[10px] tracking-[0.15em] uppercase font-mono"
          style={{ color: "oklch(0.62 0 0)" }}
        >
          Cancel
        </button>
        <span className="text-sm font-bold font-mono tracking-[0.1em] uppercase" style={{ color: "var(--accent)" }}>
          New Post
        </span>
        <div style={{ width: 48 }} />
      </header>

      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col flex-1">
        <label className="relative block cursor-pointer">
          {preview ? (
            <img src={preview} alt="Preview" className="w-full aspect-square object-cover block" />
          ) : (
            <div
              className="w-full aspect-square flex flex-col items-center justify-center gap-4"
              style={{ background: "oklch(0.1 0 0)", border: "1px dashed oklch(0.22 0 0)" }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: "var(--accent-dim)", border: "1px solid var(--accent)" }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
              <span className="text-[10px] tracking-[0.2em] uppercase font-mono" style={{ color: "oklch(0.62 0 0)" }}>
                Select image
              </span>
            </div>
          )}
          <input name="image" type="file" accept="image/jpeg,image/png" required className="sr-only" onChange={handleFile} />
        </label>

        <div className="px-5 pt-5 pb-6 flex flex-col gap-5 flex-1">
          <textarea
            name="caption"
            placeholder="Write a caption…"
            rows={3}
            className="w-full bg-transparent text-sm resize-none outline-none border-b pb-2"
            style={{ borderColor: "oklch(0.2 0 0)", color: "#fff" }}
          />

          {error && <p className="text-sm" style={{ color: "#ff3b5c" }}>{error}</p>}

          <button
            type="submit"
            disabled={creating}
            className="w-full py-3 text-sm font-bold tracking-[0.15em] uppercase font-mono transition-all disabled:opacity-40"
            style={{
              background: creating ? "oklch(0.2 0 0)" : "var(--accent)",
              color: creating ? "oklch(0.62 0 0)" : "#000",
              boxShadow: creating ? "none" : "var(--accent-glow)",
            }}
          >
            {creating ? "Sharing…" : "Share"}
          </button>
        </div>
      </form>
    </div>
  );
}
