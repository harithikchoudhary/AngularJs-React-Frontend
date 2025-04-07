import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Analysis from "./pages/Analysis";
import Navbar from "./components/NavBar";
import ChatComponent from "./components/Chat";
import Welcome from "./pages/Welcome";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/chat" element={<ChatComponent />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;