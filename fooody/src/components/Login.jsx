import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import '../stylesheets/Login.css';
import '../stylesheets/Buttons.css';
import getApiUrl from "../config";
function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const API_URL = getApiUrl();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      login(data.token, data.user); 
      navigate("/profile");
    } catch (err) {
      setError("Something went wrong.");
    }
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleLogin}>
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
       <span className="input-group">
        <span className='label'>Email</span>
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        /></span>
        <span className='input-group'>
        <span className='label'>Password</span>
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        /></span>

        <button className="button" type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
