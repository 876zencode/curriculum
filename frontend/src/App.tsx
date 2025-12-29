import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { LanguageCurriculumPage } from "./pages/LanguageCurriculumPage";
import { CacheAdminPage } from "./pages/CacheAdminPage";
import { SubtopicPage } from "./pages/SubtopicPage";
import { CurriculumExportPage } from "./pages/CurriculumExportPage";
import { FeedbackWidget } from "./components/FeedbackWidget";
import { useAuth } from "./lib/auth";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";

function App() {
  const { user, status, signInWithGoogle, signOut, isConfigured } = useAuth();

  return (
    <Router>
      <div className="container mx-auto p-4">
        <header className="flex justify-between items-center mb-6">
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
              <div className="flex items-center gap-2 text-sm">
                <span className="hidden md:inline text-muted-foreground">{user.email}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  disabled={status === "loading"}
                >
                  <LogOut className="mr-1 h-4 w-4" />
                  Sign out
                </Button>
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
