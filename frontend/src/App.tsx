import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { LanguageCurriculumPage } from "./pages/LanguageCurriculumPage"; // Import new page
import { CacheAdminPage } from "./pages/CacheAdminPage";

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
            <Route path="/cache" element={<CacheAdminPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
