import React from "react";
import Typewriter from "./Typewriter.jsx";  
import "../stylesheets/welcome.css";

function Welcome() {
     
  return (
    <div className="welcome_page">
    <Typewriter
  text="Foody"
  speed={500}
  delay={800}
  
/>

    </div>
  );
}

export default Welcome;
