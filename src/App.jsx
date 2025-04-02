import { useState } from "react";
import Analysis from "./pages/Analysis";


function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <Analysis/>
  );
}

export default App;
