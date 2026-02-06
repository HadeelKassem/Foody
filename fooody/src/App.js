import { Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Feed from "./components/Feed";
import Settings from "./components/Settings";
import Login from "./components/Login";
import Profile from "./components/Profile";
import Choosing from "./components/Choosing.jsx";
import Signup from "./components/Signup";
import Welcome from "./components/Welcome.jsx";
import ViewUserProfile from "./components/ViewUserProfile.jsx";
import "./App.css";
import { DarkModeProvider } from "./context/DarkModeContext";
function App() {
  const [darkMode, setDarkMode] = useState(false);

  // Optional: persist dark mode across refresh
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedMode);
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);
  return (
    <DarkModeProvider>
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route
        path="/main"
        element={
          <div>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Feed />
            </div>
          </div>
        }
      />
      <Route path="/settings" element={<Settings />} />
      <Route path="/choosing" element={<Choosing />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      {/* Logged-in user's profile */}
      <Route path="/profile" element={<Profile viewOnly={false} />} />
      {/* Other users' profile (view only) */}
      <Route path="/user/:userId" element={<ViewUserProfile />} />
    </Routes>
    </DarkModeProvider>
  );
}

export default App;
