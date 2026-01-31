import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
// import './App.css' // Optional, can remove if not using default styling

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Hero />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
