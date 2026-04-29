import { useState, useEffect } from "react";
import PostCard, { type Post } from "../components/PostCard";
import type { Auth, Page } from "../App";

const API = "http://localhost:3000";

type Props = {
  auth: Auth;
  onLogout: () => void;
  goTo: (page: Page, username?: string) => void;
};

export default function FeedPage({ auth, onLogout, goTo }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const authHeader = { Authorization: `Bearer ${auth.token}` };

  const fetchFeed = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/feed`, { headers: authHeader });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPosts(data);
    } catch {
      setError("Could not load feed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFeed(); }, []);

  const handleDelete = (postId: number) => {
    setPosts((p) => p.filter((x) => x.id !== postId));
  };

  return (
    <div className="flex flex-col flex-1">
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-5 pb-4 page-header"
        style={{ background: "oklch(0.07 0 0)", borderBottom: "1px solid oklch(0.14 0 0)" }}
      >
        <span
          className="text-xl font-black font-mono logo-glow"
          style={{ letterSpacing: "-0.04em", color: "#fff" }}
        >
          SOCLR
        </span>

        <div className="flex items-center gap-3">
          <button
            onClick={() => goTo("myprofile")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-sm transition-all hover:opacity-80"
            style={{ background: "oklch(0.14 0 0)", border: "1px solid oklch(0.2 0 0)" }}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
            >
              {auth.user.username[0]?.toUpperCase()}
            </div>
            <span className="text-xs font-medium" style={{ color: "oklch(0.7 0 0)" }}>
              {auth.user.username}
            </span>
          </button>

          <button
            onClick={onLogout}
            className="text-[10px] tracking-[0.12em] uppercase"
            style={{ color: "oklch(0.56 0 0)" }}
          >
            Out
          </button>
        </div>
      </header>

      <main className="flex-1">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <span className="text-xs tracking-widest uppercase font-mono" style={{ color: "oklch(0.56 0 0)" }}>
              Loading…
            </span>
          </div>
        )}
        {error && (
          <p className="text-center py-8 text-sm" style={{ color: "#ff3b5c" }}>{error}</p>
        )}
        {!loading && !error && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: "var(--accent-dim)", border: "1px solid var(--accent)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <p className="text-sm font-mono" style={{ color: "oklch(0.62 0 0)" }}>Nothing here yet.</p>
            <button
              onClick={() => goTo("explore")}
              className="text-xs tracking-widest uppercase"
              style={{ color: "var(--accent)" }}
            >
              Find people →
            </button>
          </div>
        )}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUser={auth.user.username}
            goTo={goTo}
            onDelete={handleDelete}
          />
        ))}
      </main>
    </div>
  );
}
