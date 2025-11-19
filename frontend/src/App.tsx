import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { SavedSourcesPage } from "./pages/SavedSourcesPage";
import { CurriculumBreakdownPage } from "./pages/CurriculumBreakdownPage"; // Import new page
import { Button } from "./components/ui/button";

function App() {
  return (
    <Router>
      <div className="container mx-auto p-4">
        <header className="flex justify-between items-center mb-6">
          <Link to="/">
            <h1 className="text-3xl font-bold">Source of Truth Finder</h1>
          </Link>
          <nav>
            <Link to="/saved">
              <Button variant="outline">Saved Sources</Button>
            </Link>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/saved" element={<SavedSourcesPage />} />
            <Route path="/learn/:sourceId" element={<CurriculumBreakdownPage />} /> {/* New route */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
