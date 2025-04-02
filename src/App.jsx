import Analysis from "./pages/Analysis";
import Navbar from "./components/NavBar";
function App() {
 
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Analysis />
    </div>
  );
}
 
export default App;