import { useState } from "react";
import AuthPage from "./pages/AuthPage";
import FeedPage from "./pages/FeedPage";
import ExplorePage from "./pages/ExplorePage";
import ProfilePage from "./pages/ProfilePage";
import MyProfilePage from "./pages/MyProfilePage";
import ComposePage from "./pages/ComposePage";
import Navbar from "./components/Navbar";
import "./index.css";

export type User = { username: string; email: string };
export type Auth = { token: string; user: User };
export type Page = "feed" | "explore" | "compose" | "profile" | "myprofile";

export type NavState = {
  page: Page;
  profileUsername?: string;
};

function loadAuth(): Auth | null {
  try {
    const s = localStorage.getItem("auth");
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

export function App() {
  const [auth, setAuth] = useState<Auth | null>(loadAuth);
  const [nav, setNav] = useState<NavState>({ page: "feed" });

  const handleLogin = (token: string, user: User) => {
    const next = { token, user };
    setAuth(next);
    localStorage.setItem("auth", JSON.stringify(next));
  };

  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem("auth");
  };

  const goTo = (page: Page, profileUsername?: string) =>
    setNav({ page, profileUsername });

  if (!auth) return <AuthPage onLogin={handleLogin} />;

  const showNav = nav.page !== "compose";

  return (
    <div className="app-shell" style={{ paddingBottom: showNav ? "calc(var(--nav-height) + env(safe-area-inset-bottom, 0px))" : 0 }}>
      {nav.page === "feed" && (
        <FeedPage auth={auth} onLogout={handleLogout} goTo={goTo} />
      )}
      {nav.page === "explore" && (
        <ExplorePage auth={auth} goTo={goTo} />
      )}
      {nav.page === "compose" && (
        <ComposePage auth={auth} goTo={goTo} />
      )}
      {nav.page === "profile" && nav.profileUsername && (
        <ProfilePage auth={auth} username={nav.profileUsername} goTo={goTo} />
      )}
      {nav.page === "myprofile" && (
        <MyProfilePage auth={auth} onLogout={handleLogout} goTo={goTo} />
      )}
      {showNav && <Navbar current={nav.page} goTo={goTo} />}
    </div>
  );
}

export default App;
