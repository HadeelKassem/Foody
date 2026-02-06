import React from "react";
import "../stylesheets/Navbar.css";
import { DarkModeContext } from "../context/DarkModeContext";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
export default function Navbar() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isLoggedIn = !!user; 
  const { darkMode, setDarkMode } = useContext(DarkModeContext);
  const handleClick=()=>{
    if(isLoggedIn){
      navigate("/profile");
    }
    else{
      navigate("/choosing");
    }
  };
 
  return (
    <nav className="navbar">
      <div className="logo">Foody</div>
     
      <div className="nav-actions">
        <button className="button" onClick={handleClick}>👤</button>
       <a href="/settings"><button className="button" >⚙️</button></a>
      
       
      </div>
    </nav>
  );
}

