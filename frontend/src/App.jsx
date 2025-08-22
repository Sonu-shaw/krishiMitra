import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./components/AuthContext";

import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dealer from "./pages/Dealer"; 
import ChatBot from "./components/ChatBot"; // ✅ Import ChatBot

export default function App() {
  const [selectedLocation, setSelectedLocation] = useState({ state: "", district: "" });

  return (
    <AuthProvider>
      <Router>
        <NavBar />

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home setSelectedLocation={setSelectedLocation} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/about"
            element={
              <ProtectedRoute>
                <About />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dealer"
            element={
              <ProtectedRoute role="dealer">
                <Dealer />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        {/* ✅ ChatBot is globally available */}
        <ChatBot />
      </Router>
    </AuthProvider>
  );
}

// ProtectedRoute component
function ProtectedRoute({ children, role }) {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;

  return children;
}
