import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { LanguageCurriculumPage } from "./pages/LanguageCurriculumPage";
import { CacheAdminPage } from "./pages/CacheAdminPage";
import { SubtopicPage } from "./pages/SubtopicPage";
import { CurriculumExportPage } from "./pages/CurriculumExportPage";
import { FeedbackWidget } from "./components/FeedbackWidget";
import { useAuth } from "./lib/auth";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User as UserIcon } from "lucide-react";
import { useState } from "react";

function App() {
  const { user, status, signInWithGoogle, signOut, isConfigured, firstName } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const initial = (firstName || user?.email || "?").charAt(0).toUpperCase();

  return (
    <Router>
      <div className="container mx-auto p-4">
        <header className="flex justify-between items-center mb-6 relative">
          <Link to="/">
            <h1 className="text-3xl font-bold">Intellibus Curriculum</h1>
          </Link>
          <div className="flex items-center gap-3">
            <FeedbackWidget
              context="Global navigation feedback"
              triggerLabel="Share feedback"
              size="sm"
              ctaHint="Tell us what feels clunky or missing anywhere in the app."
            />
            {user ? (
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => setMenuOpen((o) => !o)}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-xs">
                    {initial}
                  </span>
                  <span className="hidden md:inline text-sm">{firstName || user.email}</span>
                </Button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-44 rounded-md border bg-card shadow-lg z-10">
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition"
                      onClick={() => {
                        setMenuOpen(false);
                        signOut();
                      }}
                      disabled={status === "loading"}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signInWithGoogle().catch(() => {})}
                disabled={!isConfigured || status === "loading"}
              >
                <LogIn className="mr-1 h-4 w-4" />
                Sign in with Google
              </Button>
            )}
          </div>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/language/:slug" element={<LanguageCurriculumPage />} /> {/* New language curriculum page */}
            <Route path="/language/:slug/topic/:topicId/subtopic/:subtopicId" element={<SubtopicPage />} />
            <Route path="/cache" element={<CacheAdminPage />} />
            <Route path="/admin/export" element={<CurriculumExportPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
