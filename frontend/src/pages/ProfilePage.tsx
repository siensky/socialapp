import { useState, useRef, useEffect } from "react";
import PostCard, { type Post } from "../components/PostCard";
import type { Auth, Page } from "../App";

const API = "http://localhost:3000";

type Props = { auth: Auth; username: string; goTo: (page: Page, username?: string) => void };
type ProfileUser = { username: string; bio: string; followers: number; following: number };
type FollowListUser = { username: string; bio: string };

const MOCK_PROFILES: Record<string, ProfileUser> = {
  alex_visuals:  { username: "alex_visuals",  bio: "Photographer & visual storyteller", followers: 4812, following: 312 },
  maya_codes:    { username: "maya_codes",    bio: "Building in public. Full stack.",   followers: 923,  following: 187 },
  "kai.jpeg":    { username: "kai.jpeg",      bio: "street | minimal | analog",         followers: 2341, following: 98  },
  nora_creates:  { username: "nora_creates",  bio: "Art director based in Stockholm",   followers: 7654, following: 421 },
  lev_studio:    { username: "lev_studio",    bio: "Motion design & branding",          followers: 1102, following: 203 },
  juno_archive:  { username: "juno_archive",  bio: "35mm film photography",             followers: 3387, following: 156 },
};

const PH = (seed: string) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/600/600`;

function makeMockPosts(username: string): Post[] {
  return Array.from({ length: 6 }, (_, i) => ({
    id: -(i + 1),
    caption: i === 0 ? "Shot on film last weekend" : i === 2 ? "Golden hour always wins" : null,
    image: PH(`${username}${i}`),
    username,
    created_at: new Date(Date.now() - i * 86400000 * 2).toISOString(),
  }));
}

function makeMockFollowers(username: string): FollowListUser[] {
  return [
    { username: "alex_visuals", bio: "Photographer" },
    { username: "nora_creates", bio: "Art director" },
    { username: "kai.jpeg",     bio: "street | analog" },
  ].filter((u) => u.username !== username);
}

function makeMockFollowing(username: string): FollowListUser[] {
  return [
    { username: "lev_studio",   bio: "Motion design" },
    { username: "juno_archive", bio: "35mm film" },
    { username: "maya_codes",   bio: "Full stack dev" },
  ].filter((u) => u.username !== username);
}

type ListModal = { title: string; users: FollowListUser[] } | null;

export default function ProfilePage({ auth, username, goTo }: Props) {
  const isOwn = auth.user.username === username;
  const profile = MOCK_PROFILES[username] ?? { username, bio: "", followers: 0, following: 0 };

  const [posts] = useState<Post[]>(makeMockPosts(username));
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(profile.followers);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [listModal, setListModal] = useState<ListModal>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const authHeader = { Authorization: `Bearer ${auth.token}` };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleFollow = async () => {
    setLoadingFollow(true);
    try {
      await fetch(`${API}/toggle-follow/${username}`, { method: "POST", headers: authHeader });
      setIsFollowing((f) => { setFollowerCount((c) => (f ? c - 1 : c + 1)); return !f; });
    } catch { /* silent */ } finally {
      setLoadingFollow(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Header */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-5 pb-4 page-header"
        style={{ background: "oklch(0.07 0 0)", borderBottom: "1px solid oklch(0.14 0 0)" }}
      >
        <button onClick={() => goTo("feed")} style={{ color: "oklch(0.62 0 0)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span className="text-sm font-bold font-mono tracking-wide">{username}</span>
        <div style={{ width: 18 }} />
      </header>

      {/* Profile info */}
      <div className="px-5 pt-6 pb-5" style={{ borderBottom: "1px solid oklch(0.14 0 0)" }}>
        <div className="flex items-start gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shrink-0"
            style={{
              background: isFollowing ? "var(--accent-dim)" : "oklch(0.18 0 0)",
              border: isFollowing ? "2px solid var(--accent)" : "2px solid oklch(0.22 0 0)",
              color: isFollowing ? "var(--accent)" : "oklch(0.6 0 0)",
            }}
          >
            {username[0]?.toUpperCase()}
          </div>

          <div className="flex gap-5 flex-1 pt-1">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-base font-bold">{posts.length}</span>
              <span className="text-[10px] tracking-widest uppercase font-mono" style={{ color: "oklch(0.62 0 0)" }}>Posts</span>
            </div>
            <button onClick={() => setListModal({ title: "Followers", users: makeMockFollowers(username) })} className="flex flex-col items-center gap-0.5 hover:opacity-70 transition-opacity">
              <span className="text-base font-bold">{followerCount.toLocaleString()}</span>
              <span className="text-[10px] tracking-widest uppercase font-mono" style={{ color: "oklch(0.62 0 0)" }}>Followers</span>
            </button>
            <button onClick={() => setListModal({ title: "Following", users: makeMockFollowing(username) })} className="flex flex-col items-center gap-0.5 hover:opacity-70 transition-opacity">
              <span className="text-base font-bold">{profile.following.toLocaleString()}</span>
              <span className="text-[10px] tracking-widest uppercase font-mono" style={{ color: "oklch(0.62 0 0)" }}>Following</span>
            </button>
          </div>
        </div>

        {profile.bio && (
          <p className="mt-3 text-sm" style={{ color: "oklch(0.65 0 0)" }}>{profile.bio}</p>
        )}

        {!isOwn && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={toggleFollow}
              disabled={loadingFollow}
              className="flex-1 py-2 text-xs font-bold tracking-widest uppercase font-mono rounded-sm transition-all disabled:opacity-40"
              style={
                isFollowing
                  ? { background: "transparent", color: "var(--accent)", border: "1px solid var(--accent)" }
                  : { background: "#fff", color: "#000" }
              }
            >
              {isFollowing ? "Following" : "Follow"}
            </button>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu((v) => !v)}
                className="px-3 py-2 rounded-sm"
                style={{ background: "oklch(0.15 0 0)", color: "oklch(0.6 0 0)", border: "1px solid oklch(0.22 0 0)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
                </svg>
              </button>
              {showMenu && (
                <div
                  className="absolute right-0 top-10 rounded-sm overflow-hidden animate-slide-down"
                  style={{ background: "oklch(0.13 0 0)", border: "1px solid oklch(0.22 0 0)", minWidth: 160, zIndex: 40 }}
                >
                  <button className="w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors" style={{ color: "oklch(0.8 0 0)", borderBottom: "1px solid oklch(0.18 0 0)" }} onClick={() => setShowMenu(false)}>
                    Remove follower
                  </button>
                  <button className="w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors" style={{ color: "#ff3b5c" }} onClick={() => setShowMenu(false)}>
                    Block user
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Posts grid */}
      <div className="grid grid-cols-3 gap-px" style={{ background: "oklch(0.12 0 0)" }}>
        {posts.map((post) => (
          <div key={post.id} className="aspect-square overflow-hidden">
            <img src={post.image} alt="" className="w-full h-full object-cover block" style={{ background: "oklch(0.13 0 0)" }} />
          </div>
        ))}
      </div>

      {/* List modal */}
      {listModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.75)" }} onClick={() => setListModal(null)}>
          <div className="w-full max-w-md rounded-t-xl overflow-hidden animate-slide-up" style={{ background: "oklch(0.11 0 0)", maxHeight: "60vh" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid oklch(0.18 0 0)" }}>
              <span className="text-sm font-bold font-mono tracking-wide">{listModal.title}</span>
              <button onClick={() => setListModal(null)} style={{ color: "oklch(0.62 0 0)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: "calc(60vh - 57px)" }}>
              {listModal.users.map((u) => (
                <button key={u.username} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors" style={{ borderBottom: "1px solid oklch(0.15 0 0)" }} onClick={() => { setListModal(null); goTo("profile", u.username); }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
                    {u.username[0]?.toUpperCase()}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-sm font-semibold truncate">{u.username}</p>
                    <p className="text-xs truncate" style={{ color: "oklch(0.62 0 0)" }}>{u.bio}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
