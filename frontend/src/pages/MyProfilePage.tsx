import { useState, useRef } from "react";
import PostCard, { type Post } from "../components/PostCard";
import type { Auth, Page } from "../App";

type Props = {
  auth: Auth;
  onLogout: () => void;
  goTo: (page: Page, username?: string) => void;
};

type FollowUser = { username: string; bio: string };

type SettingsSheet = "none" | "archived" | "blocked";
type ListModal = "none" | "followers" | "following";

const MOCK_FOLLOWERS: FollowUser[] = [
  { username: "alex_visuals", bio: "Photographer & visual storyteller" },
  { username: "kai.jpeg",     bio: "street | minimal | analog" },
  { username: "nora_creates", bio: "Art director based in Stockholm" },
];

const MOCK_FOLLOWING: FollowUser[] = [
  { username: "lev_studio",   bio: "Motion design & branding" },
  { username: "juno_archive", bio: "35mm film photography" },
];

const PLACEHOLDER = (seed: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/600/600`;

function makePosts(username: string): Post[] {
  return Array.from({ length: 9 }, (_, i) => ({
    id: -(i + 1),
    caption: i === 0 ? "First post" : i === 3 ? "Good light today" : null,
    image: PLACEHOLDER(`${username}own${i}`),
    username,
    created_at: new Date(Date.now() - i * 86400000 * 1.5).toISOString(),
  }));
}

function makeArchivedPosts(username: string): Post[] {
  return Array.from({ length: 3 }, (_, i) => ({
    id: -(100 + i),
    caption: null,
    image: PLACEHOLDER(`${username}arch${i}`),
    username,
    created_at: new Date(Date.now() - i * 86400000 * 10).toISOString(),
  }));
}

const MOCK_BLOCKED: FollowUser[] = [
  { username: "spam_account99", bio: "" },
  { username: "troll_user",     bio: "definitely not a bot" },
];

const GearIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

export default function MyProfilePage({ auth, onLogout, goTo }: Props) {
  const username = auth.user.username;

  const [bio, setBio] = useState("Living the moment. Building things.");
  const [editingBio, setEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(bio);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [followerCount] = useState(MOCK_FOLLOWERS.length);
  const [posts, setPosts] = useState<Post[]>(makePosts(username));
  const [listModal, setListModal] = useState<ListModal>("none");
  const [settingsSheet, setSettingsSheet] = useState<SettingsSheet>("none");
  const [blockedUsers, setBlockedUsers] = useState(MOCK_BLOCKED);
  const [archivedPosts] = useState(makeArchivedPosts(username));
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const saveBio = () => {
    setBio(bioInput.trim() || bio);
    setEditingBio(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAvatarSrc(URL.createObjectURL(file));
  };

  const unblock = (u: string) =>
    setBlockedUsers((b) => b.filter((x) => x.username !== u));

  return (
    <div className="flex flex-col flex-1">
      {/* Header */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-5 pb-4 page-header"
        style={{ background: "oklch(0.07 0 0)", borderBottom: "1px solid oklch(0.14 0 0)" }}
      >
        <button
          onClick={() => goTo("feed")}
          style={{ color: "oklch(0.62 0 0)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <span className="text-sm font-bold font-mono tracking-wide" style={{ color: "#fff" }}>
          {username}
        </span>

        {/* Settings gear */}
        <div className="relative">
          <button
            onClick={() => setShowSettingsMenu((v) => !v)}
            style={{ color: "oklch(0.55 0 0)" }}
            className="transition-colors hover:text-white"
          >
            <GearIcon />
          </button>

          {showSettingsMenu && (
            <div
              className="absolute right-0 top-8 rounded overflow-hidden animate-slide-down"
              style={{
                background: "oklch(0.13 0 0)",
                border: "1px solid oklch(0.22 0 0)",
                minWidth: 180,
                zIndex: 60,
              }}
            >
              <button
                className="w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors flex items-center gap-3"
                style={{ color: "oklch(0.8 0 0)", borderBottom: "1px solid oklch(0.16 0 0)" }}
                onClick={() => { setShowSettingsMenu(false); setSettingsSheet("archived"); }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
                Archived posts
              </button>
              <button
                className="w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors flex items-center gap-3"
                style={{ color: "oklch(0.8 0 0)", borderBottom: "1px solid oklch(0.16 0 0)" }}
                onClick={() => { setShowSettingsMenu(false); setSettingsSheet("blocked"); }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                Blocked users
              </button>
              <button
                className="w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors flex items-center gap-3"
                style={{ color: "#ff3b5c" }}
                onClick={() => { setShowSettingsMenu(false); onLogout(); }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Log out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Profile info */}
      <div className="px-5 pt-6 pb-5" style={{ borderBottom: "1px solid oklch(0.14 0 0)" }}>
        <div className="flex items-start gap-4">
          {/* Tappable avatar */}
          <button onClick={() => fileRef.current?.click()} className="relative shrink-0 group">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="avatar"
                className="w-16 h-16 rounded-full object-cover"
                style={{ border: "2px solid oklch(0.22 0 0)" }}
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
                style={{
                  background: "var(--accent-dim)",
                  border: "2px solid var(--accent)",
                  color: "var(--accent)",
                  boxShadow: "var(--accent-glow)",
                }}
              >
                {username[0]?.toUpperCase()}
              </div>
            )}
            <div
              className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "rgba(0,0,0,0.55)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} />
          </button>

          {/* Stats */}
          <div className="flex gap-5 flex-1 pt-1">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-base font-bold">{posts.length}</span>
              <span className="text-[10px] tracking-widest uppercase font-mono" style={{ color: "oklch(0.62 0 0)" }}>Posts</span>
            </div>
            <button
              onClick={() => setListModal("followers")}
              className="flex flex-col items-center gap-0.5 hover:opacity-70 transition-opacity"
            >
              <span className="text-base font-bold">{followerCount}</span>
              <span className="text-[10px] tracking-widest uppercase font-mono" style={{ color: "oklch(0.62 0 0)" }}>Followers</span>
            </button>
            <button
              onClick={() => setListModal("following")}
              className="flex flex-col items-center gap-0.5 hover:opacity-70 transition-opacity"
            >
              <span className="text-base font-bold">{MOCK_FOLLOWING.length}</span>
              <span className="text-[10px] tracking-widest uppercase font-mono" style={{ color: "oklch(0.62 0 0)" }}>Following</span>
            </button>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-4">
          {editingBio ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                rows={2}
                autoFocus
                className="w-full bg-transparent text-sm resize-none outline-none border-b pb-1"
                style={{ borderColor: "var(--accent)", color: "#fff" }}
              />
              <div className="flex gap-3">
                <button
                  onClick={saveBio}
                  className="text-xs font-semibold tracking-wide px-3 py-1 rounded-sm"
                  style={{ background: "var(--accent)", color: "#000" }}
                >
                  Save
                </button>
                <button
                  onClick={() => { setEditingBio(false); setBioInput(bio); }}
                  className="text-xs tracking-wide"
                  style={{ color: "oklch(0.62 0 0)" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { setBioInput(bio); setEditingBio(true); }}
              className="text-left group"
            >
              <p className="text-sm" style={{ color: "oklch(0.7 0 0)" }}>{bio}</p>
              <span
                className="text-[10px] tracking-widest uppercase font-mono opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: "var(--accent)" }}
              >
                Edit bio
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Posts grid */}
      <div className="grid grid-cols-3 gap-px flex-1" style={{ background: "oklch(0.12 0 0)" }}>
        {posts.map((post) => (
          <div key={post.id} className="aspect-square overflow-hidden">
            <img
              src={post.image}
              alt=""
              className="w-full h-full object-cover block"
              style={{ background: "oklch(0.13 0 0)" }}
            />
          </div>
        ))}
      </div>

      {/* Followers / Following modal */}
      {listModal !== "none" && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.75)" }}
          onClick={() => setListModal("none")}
        >
          <div
            className="w-full max-w-md rounded-t-xl overflow-hidden animate-slide-up"
            style={{ background: "oklch(0.11 0 0)", maxHeight: "60vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader
              title={listModal === "followers" ? "Followers" : "Following"}
              onClose={() => setListModal("none")}
            />
            <div className="overflow-y-auto" style={{ maxHeight: "calc(60vh - 57px)" }}>
              {(listModal === "followers" ? MOCK_FOLLOWERS : MOCK_FOLLOWING).map((u) => (
                <UserRow key={u.username} user={u} onPress={() => { setListModal("none"); goTo("profile", u.username); }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings bottom sheet */}
      {settingsSheet !== "none" && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.75)" }}
          onClick={() => setSettingsSheet("none")}
        >
          <div
            className="w-full max-w-md rounded-t-xl overflow-hidden animate-slide-up"
            style={{ background: "oklch(0.11 0 0)", maxHeight: "70vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader
              title={settingsSheet === "archived" ? "Archived posts" : "Blocked users"}
              onClose={() => setSettingsSheet("none")}
            />
            <div className="overflow-y-auto" style={{ maxHeight: "calc(70vh - 57px)" }}>
              {settingsSheet === "archived" && (
                <div className="grid grid-cols-3 gap-px" style={{ background: "oklch(0.12 0 0)" }}>
                  {archivedPosts.map((p) => (
                    <div key={p.id} className="aspect-square overflow-hidden relative">
                      <img src={p.image} alt="" className="w-full h-full object-cover block" style={{ background: "oklch(0.13 0 0)" }} />
                      <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.35)" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {settingsSheet === "blocked" && (
                <>
                  {blockedUsers.length === 0 && (
                    <p className="text-center py-10 text-sm font-mono" style={{ color: "oklch(0.56 0 0)" }}>
                      No blocked users.
                    </p>
                  )}
                  {blockedUsers.map((u) => (
                    <div
                      key={u.username}
                      className="flex items-center gap-3 px-5 py-3"
                      style={{ borderBottom: "1px solid oklch(0.16 0 0)" }}
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                        style={{ background: "oklch(0.2 0 0)", color: "oklch(0.6 0 0)" }}
                      >
                        {u.username[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm flex-1 font-medium" style={{ color: "oklch(0.7 0 0)" }}>
                        {u.username}
                      </span>
                      <button
                        onClick={() => unblock(u.username)}
                        className="text-xs px-3 py-1 rounded-sm font-semibold tracking-wide"
                        style={{ border: "1px solid oklch(0.3 0 0)", color: "oklch(0.6 0 0)" }}
                      >
                        Unblock
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div
      className="flex items-center justify-between px-5 py-4"
      style={{ borderBottom: "1px solid oklch(0.18 0 0)" }}
    >
      <span className="text-sm font-bold font-mono tracking-wide">{title}</span>
      <button onClick={onClose} style={{ color: "oklch(0.62 0 0)" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}

function UserRow({ user, onPress }: { user: { username: string; bio: string }; onPress: () => void }) {
  return (
    <button
      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors"
      style={{ borderBottom: "1px solid oklch(0.15 0 0)" }}
      onClick={onPress}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
        style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
      >
        {user.username[0]?.toUpperCase()}
      </div>
      <div className="text-left min-w-0">
        <p className="text-sm font-semibold truncate">{user.username}</p>
        {user.bio && <p className="text-xs truncate" style={{ color: "oklch(0.62 0 0)" }}>{user.bio}</p>}
      </div>
    </button>
  );
}
