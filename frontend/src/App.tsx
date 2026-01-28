import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { LanguageCurriculumPage } from "./pages/LanguageCurriculumPage";
import { CacheAdminPage } from "./pages/CacheAdminPage";
import { SubtopicPage } from "./pages/SubtopicPage";
import { CurriculumExportPage } from "./pages/CurriculumExportPage";
import { FeedbackAdminPage } from "./pages/FeedbackAdminPage";
import { useClickSfx } from "./hooks/useClickSfx";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div key={location.pathname} className="min-h-screen animate-fade-up">
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/language/:slug" element={<LanguageCurriculumPage />} /> {/* New language curriculum page */}
        <Route path="/language/:slug/topic/:topicId/subtopic/:subtopicId" element={<SubtopicPage />} />
        <Route path="/cache" element={<CacheAdminPage />} />
        <Route path="/admin/export" element={<CurriculumExportPage />} />
        <Route path="/admin/feedback" element={<FeedbackAdminPage />} />
      </Routes>
    </div>
  );
}

function App() {
  useClickSfx();

  return (
    <Router>
      <div>
        <main>
          <AnimatedRoutes />
        </main>
      </div>
    </Router>
  );
}

export default App;
