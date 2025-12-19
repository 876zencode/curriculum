import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { LanguageCurriculumPage } from "./pages/LanguageCurriculumPage";
import { CacheAdminPage } from "./pages/CacheAdminPage";
import { SubtopicPage } from "./pages/SubtopicPage";
import { CurriculumExportPage } from "./pages/CurriculumExportPage";

function App() {
  return (
    <Router>
      <div className="container mx-auto p-4">
        <header className="flex justify-between items-center mb-6">
          <Link to="/">
            <h1 className="text-3xl font-bold">Intellibus Curriculum</h1>
          </Link>
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
