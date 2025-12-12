import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MovieProvider } from "./context/MovieDetailContext";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MovieProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </MovieProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
