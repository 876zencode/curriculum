import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { LanguageCurriculumPage } from "./pages/LanguageCurriculumPage";
import { CacheAdminPage } from "./pages/CacheAdminPage";
import { SubtopicPage } from "./pages/SubtopicPage";
import { CurriculumExportPage } from "./pages/CurriculumExportPage";
import { FeedbackAdminPage } from "./pages/FeedbackAdminPage";
import { FeedbackWidget } from "./components/FeedbackWidget";
import { useAuth } from "./lib/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useState } from "react";

function App() {
  const { user, status, signOut, firstName } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const initial = (firstName || user?.email || "?").charAt(0).toUpperCase();

  return (
    <Router>
      <div className="container mx-auto p-4">
        <header className="mb-6 relative space-y-3">
          <div className="flex items-start justify-between gap-3 md:items-center md:flex-row flex-col text-center md:text-left">
            <Link to="/" className="w-full md:w-auto">
              <h1 className="text-3xl font-bold md:text-left text-center">Intellibus Academy Curriculum</h1>
            </Link>
            <div className="hidden md:flex items-center gap-3">
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
                  className="flex items-center gap-2 justify-center"
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
              ) : null}
            </div>
          </div>
          <div className="flex flex-col gap-2 md:hidden">
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
                  className="flex items-center gap-2 w-full justify-center"
                  onClick={() => setMenuOpen((o) => !o)}
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-xs">
                      {initial}
                    </span>
                    <span className="text-sm">{firstName || user.email}</span>
                  </div>
                </Button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-full rounded-md border bg-card shadow-lg z-10">
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
            ) : null}
          </div>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/language/:slug" element={<LanguageCurriculumPage />} /> {/* New language curriculum page */}
            <Route path="/language/:slug/topic/:topicId/subtopic/:subtopicId" element={<SubtopicPage />} />
            <Route path="/cache" element={<CacheAdminPage />} />
            <Route path="/admin/export" element={<CurriculumExportPage />} />
            <Route path="/admin/feedback" element={<FeedbackAdminPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
