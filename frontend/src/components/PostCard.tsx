import { useState, useRef, useEffect } from "react";
import type { Page } from "../App";

export type Post = {
  id: number;
  caption: string | null;
  image: string;
  username: string;
  created_at: string;
};

export type Comment = {
  id: number;
  username: string;
  text: string;
};

type Props = {
  post: Post;
  currentUser: string;
  goTo: (page: Page, username?: string) => void;
  onDelete?: (postId: number) => void;
};

const MOCK_COMMENTS: Record<number, Comment[]> = {};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function PostCard({ post, currentUser, goTo, onDelete }: Props) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 80) + 1);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>(
    MOCK_COMMENTS[post.id] ?? []
  );
  const [commentText, setCommentText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (showComments && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [showComments]);

  const toggleLike = () => {
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => (next ? c + 1 : c - 1));
    if (next) {
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 700);
    }
  };

  const handleDoubleTap = () => {
    if (!liked) toggleLike();
  };

  const submitComment = () => {
    const text = commentText.trim();
    if (!text) return;
    const next: Comment = { id: Date.now(), username: currentUser, text };
    setComments((c) => [...c, next]);
    setCommentText("");
  };

  const deleteComment = (id: number) => {
    setComments((c) => c.filter((x) => x.id !== id));
  };

  return (
    <article style={{ borderBottom: "1px solid oklch(0.2 0 0)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => goTo("profile", post.username)}
          className="flex items-center gap-3 min-w-0"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: "oklch(0.25 0 0)", color: "#fff" }}
          >
            {post.username[0]?.toUpperCase()}
          </div>
          <span className="font-semibold text-sm tracking-tight">
            {post.username}
          </span>
        </button>
        <span
          className="text-xs ml-auto shrink-0"
          style={{ color: "oklch(0.62 0 0)" }}
        >
          {timeAgo(post.created_at)}
        </span>

        {/* Three-dot menu */}
        <div className="relative ml-2" ref={menuRef}>
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="flex items-center justify-center w-7 h-7 rounded"
            style={{ color: "oklch(0.55 0 0)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2"/>
              <circle cx="12" cy="12" r="2"/>
              <circle cx="12" cy="19" r="2"/>
            </svg>
          </button>
          {showMenu && (
            <div
              className="absolute right-0 top-8 rounded overflow-hidden animate-slide-down"
              style={{
                background: "oklch(0.18 0 0)",
                border: "1px solid oklch(0.28 0 0)",
                minWidth: "140px",
                zIndex: 40,
              }}
            >
              {post.username === currentUser && onDelete && (
                <button
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                  style={{ color: "#ff3b5c" }}
                  onClick={() => { setShowMenu(false); onDelete(post.id); }}
                >
                  Delete post
                </button>
              )}
              <button
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                style={{ color: "oklch(0.85 0 0)" }}
                onClick={() => setShowMenu(false)}
              >
                Archive
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Image */}
      <div className="relative" onDoubleClick={handleDoubleTap}>
        <img
          src={post.image}
          alt={post.caption ?? ""}
          className="w-full aspect-square object-cover block"
          style={{ background: "oklch(0.15 0 0)" }}
        />
        {showBurst && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg
              className="like-burst"
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="#ff3b5c"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pt-3 pb-1 flex items-center gap-4">
        <button onClick={toggleLike} className="flex items-center gap-1.5 transition-transform active:scale-90">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={liked ? "#ff3b5c" : "none"}
            stroke={liked ? "#ff3b5c" : "currentColor"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span className="text-sm tabular-nums" style={{ color: liked ? "#ff3b5c" : "oklch(0.7 0 0)" }}>
            {likeCount}
          </span>
        </button>

        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 transition-transform active:scale-90"
          style={{ color: "oklch(0.7 0 0)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span className="text-sm tabular-nums">{comments.length}</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: showComments ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
              marginLeft: 2,
            }}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="px-4 pb-2">
          <p className="text-sm">
            <span className="font-semibold mr-1.5">{post.username}</span>
            <span style={{ color: "oklch(0.8 0 0)" }}>{post.caption}</span>
          </p>
        </div>
      )}

      {/* Comments dropdown */}
      {showComments && (
        <div className="animate-slide-down px-4 pb-3" style={{ borderTop: "1px solid oklch(0.18 0 0)" }}>
          <div className="pt-3 flex flex-col gap-2 max-h-48 overflow-y-auto">
            {comments.length === 0 && (
              <p className="text-xs" style={{ color: "oklch(0.62 0 0)" }}>
                No comments yet.
              </p>
            )}
            {comments.map((c) => (
              <div key={c.id} className="flex items-start gap-2 group">
                <span className="font-semibold text-xs shrink-0">{c.username}</span>
                <span className="text-xs flex-1" style={{ color: "oklch(0.75 0 0)" }}>{c.text}</span>
                {c.username === currentUser && (
                  <button
                    onClick={() => deleteComment(c.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-xs shrink-0"
                    style={{ color: "#ff3b5c" }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <input
              ref={inputRef}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitComment()}
              placeholder="Add a comment…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-[oklch(0.56_0_0)] border-b pb-1"
              style={{ borderColor: "oklch(0.3 0 0)", color: "#fff" }}
            />
            <button
              onClick={submitComment}
              className="text-xs font-semibold shrink-0"
              style={{ color: commentText.trim() ? "#fff" : "oklch(0.56 0 0)" }}
            >
              Post
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
