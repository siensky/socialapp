import type { Page } from "../App";

type Props = { current: Page; goTo: (page: Page) => void };

const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="1"/>
    <line x1="12" y1="8" x2="12" y2="16"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

export default function Navbar({ current, goTo }: Props) {
  const isActive = (p: Page) =>
    current === p || (p === "feed" && current === "myprofile");

  const btn = (page: Page, icon: React.ReactNode, label: string) => {
    const active = isActive(page);
    return (
      <button
        onClick={() => goTo(page)}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          height: "var(--nav-height)",
          color: active ? "var(--accent)" : "oklch(0.56 0 0)",
          position: "relative",
          minHeight: 44,
          border: "none",
          background: "none",
        }}
      >
        {active && (
          <span style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 24,
            height: 2,
            background: "var(--accent)",
            boxShadow: "var(--accent-glow)",
            borderRadius: 2,
          }} />
        )}
        {icon}
        <span style={{
          fontSize: 9,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          fontFamily: "monospace",
          color: active ? "var(--accent)" : "oklch(0.56 0 0)",
        }}>
          {label}
        </span>
      </button>
    );
  };

  return (
    /* Outer wrapper: full viewport width, fixed at bottom */
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
      background: "oklch(0.09 0 0)",
      borderTop: "1px solid oklch(0.16 0 0)",
    }}>
      {/* Inner: capped at app width, centered */}
      <div style={{
        maxWidth: 448,
        margin: "0 auto",
        display: "flex",
      }}>
        {btn("feed",    <HomeIcon />,   "Home")}
        {btn("compose", <PlusIcon />,   "Post")}
        {btn("explore", <SearchIcon />, "Explore")}
      </div>
    </div>
  );
}
