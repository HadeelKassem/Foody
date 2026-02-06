import React, { useContext } from "react";
import "../stylesheets/Sidebar.css";
import { AuthContext } from "../context/AuthContext";
function Sidebar() {
  const { user } = useContext(AuthContext);
  var username='';
  if (user === null)  username =' Guest';
  else username= user.username;
  return (
    <aside className="sidebar">
      
  
      <p>{username}</p>
      <ul>
        <li>Home</li>
        <li>Profile</li>
       
        <li>Settings</li>
      </ul>
    </aside>
  );
}


export default Sidebar;
