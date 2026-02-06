import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Typewriter({ text, speed = 50 }) {
  const [displayed, setDisplayed] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let i = 0;

    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;

      if (i === text.length) {
        clearInterval(interval);
        setTimeout(() => {
          navigate("/main");
        }, 800);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, navigate]);

  return <p className="title">{displayed}</p>;
}
