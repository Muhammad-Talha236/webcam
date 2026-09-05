import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";

import Home from "./pages/Home";
import CreateReel from "./pages/CreateReel";
import Viewer from "./pages/Viewer";


function App() {
  return (
    <BrowserRouter>
      <div className="app bg-amber-50">

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateReel />} />
          <Route path="/viewer" element={<Viewer />} />
        </Routes>

        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;