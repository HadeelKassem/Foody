import React from "react";
import { useNavigate } from "react-router-dom";
import "../stylesheets/Choosing.css";
function ChooseAuth() {
  const navigate = useNavigate();

  return (
    <div className="choose-auth-wrapper">
      <div className="choose-auth-container">
        <h2>Welcome!</h2>
        <p>Ready to get started ? </p>

        <div className="choose-auth-buttons">
          <button onClick={() => navigate("/login")} className="auth-btn login">
            Login
          </button>or
          <button onClick={() => navigate("/signup")} className="auth-btn signup">
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}


export default ChooseAuth;
