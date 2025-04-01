import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Analysis from "./pages/Analysis";
import AnalysisResult from "./pages/AnalysisResult";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <Router>
      <div className="min-h-screen flex">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <main
          className={`transition-all duration-300 flex-1 bg-gray-50 ${
            isSidebarOpen ? "ml-64" : "ml-16"
          }`}
        >
          <div className="p-8">
            <Routes>
              <Route path="/" element={<Analysis />} />
              <Route path="/result" element={<AnalysisResult />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
