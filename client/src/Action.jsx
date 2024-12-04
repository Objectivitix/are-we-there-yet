import { useState } from "react";
import "./Action.css";

export default function Action({ iconSrc, iconAlt, onClick }) {
  const [ripplePos, setRipplePos] = useState(null);

  function animateClick(evt) {
    const x = evt.clientX - evt.currentTarget.offsetLeft;
    const y = evt.clientY - evt.currentTarget.offsetTop;

    setRipplePos({ x, y });

    setTimeout(() => {
      setRipplePos(null);
    }, 1000);
  }

  return (
    <button className="action" onClick={(evt) => {
      animateClick(evt);
      onClick(evt);
    }}>
      <img
        className="action__icon"
        src={iconSrc}
        alt={iconAlt}
      />
      {ripplePos && (
        <span
          className="action__ripple"
          style={{ left: ripplePos.x + "px", top: ripplePos.y + "px" }}
        ></span>
      )}
    </button>
  );
}
