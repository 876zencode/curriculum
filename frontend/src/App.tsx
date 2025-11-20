import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { CurriculumBreakdownPage } from "./pages/CurriculumBreakdownPage"; // Import new page
import { LanguageCurriculumPage } from "./pages/LanguageCurriculumPage"; // Import new page

function App() {
  return (
    <Router>
      <div className="container mx-auto p-4">
        <header className="flex justify-between items-center mb-6">
          <Link to="/">
            <h1 className="text-3xl font-bold">Intellibus Curriculum</h1>
          </Link>
          <nav>
            {/* Removed Saved Sources link */}
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/language/:slug" element={<LanguageCurriculumPage />} /> {/* New language curriculum page */}
            <Route path="/language/:slug/sources/:sourceId" element={<CurriculumBreakdownPage />} /> {/* New route */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
