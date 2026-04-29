import { useState } from "react";
import type { Auth, Page } from "../App";

const API = "http://localhost:3000";

type Props = {
  auth: Auth;
  goTo: (page: Page, username?: string) => void;
};

type MockUser = { username: string; bio: string; followers: number };

const MOCK_USERS: MockUser[] = [
  { username: "alex_visuals", bio: "Photographer & visual storyteller", followers: 4812 },
  { username: "maya_codes",   bio: "Building in public. Full stack.",   followers: 923  },
  { username: "kai.jpeg",     bio: "street | minimal | analog",         followers: 2341 },
  { username: "nora_creates", bio: "Art director based in Stockholm",   followers: 7654 },
  { username: "lev_studio",   bio: "Motion design & branding",          followers: 1102 },
  { username: "juno_archive", bio: "35mm film photography",             followers: 3387 },
];

export default function ExplorePage({ auth, goTo }: Props) {
  const [query, setQuery] = useState("");
  const [followedMap, setFollowedMap] = useState<Record<string, boolean>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  const authHeader = { Authorization: `Bearer ${auth.token}` };

  const filtered = query.trim()
    ? MOCK_USERS.filter((u) => u.username.toLowerCase().includes(query.toLowerCase()))
    : MOCK_USERS;

  const toggleFollow = async (username: string) => {
    setLoadingMap((m) => ({ ...m, [username]: true }));
    try {
      await fetch(`${API}/toggle-follow/${username}`, { method: "POST", headers: authHeader });
      setFollowedMap((m) => ({ ...m, [username]: !m[username] }));
    } catch { /* silent */ } finally {
      setLoadingMap((m) => ({ ...m, [username]: false }));
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <header
        className="sticky top-0 z-20 px-5 pb-4 page-header"
        style={{ background: "oklch(0.07 0 0)", borderBottom: "1px solid oklch(0.14 0 0)" }}
      >
        <span className="text-sm font-bold font-mono tracking-[0.1em] uppercase" style={{ color: "var(--accent)" }}>
          Explore
        </span>
        <div className="mt-3 relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2"
            width="13" height="13" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            style={{ color: "oklch(0.56 0 0)" }}
          >
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people…"
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-sm outline-none transition-all"
            style={{
              background: "oklch(0.12 0 0)",
              color: "#fff",
              border: "1px solid oklch(0.2 0 0)",
            }}
          />
        </div>
      </header>

      <main>
        {filtered.length === 0 && (
          <p className="text-center py-12 text-xs font-mono tracking-widest uppercase" style={{ color: "oklch(0.56 0 0)" }}>
            No users found
          </p>
        )}
        {filtered.map((user) => {
          const isFollowing = followedMap[user.username] ?? false;
          const isLoading  = loadingMap[user.username] ?? false;
          return (
            <div
              key={user.username}
              className="flex items-center gap-3 px-5 py-4"
              style={{ borderBottom: "1px solid oklch(0.13 0 0)" }}
            >
              <button
                onClick={() => goTo("profile", user.username)}
                className="flex items-center gap-3 min-w-0 flex-1"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{
                    background: isFollowing ? "var(--accent-dim)" : "oklch(0.18 0 0)",
                    color: isFollowing ? "var(--accent)" : "oklch(0.6 0 0)",
                    border: isFollowing ? "1px solid var(--accent)" : "1px solid oklch(0.22 0 0)",
                  }}
                >
                  {user.username[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-sm font-semibold truncate">{user.username}</p>
                  <p className="text-xs truncate" style={{ color: "oklch(0.62 0 0)" }}>{user.bio}</p>
                </div>
              </button>

              <button
                onClick={() => toggleFollow(user.username)}
                disabled={isLoading}
                className="shrink-0 px-4 py-1.5 text-xs font-semibold tracking-wide rounded-sm transition-all disabled:opacity-40"
                style={
                  isFollowing
                    ? { background: "transparent", color: "var(--accent)", border: "1px solid var(--accent)" }
                    : { background: "#fff", color: "#000" }
                }
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            </div>
          );
        })}
      </main>
    </div>
  );
}
