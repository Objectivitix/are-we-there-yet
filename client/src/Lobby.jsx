import "./Lobby.css";

export default function Lobby({ onEnter }) {
  return (
    <div className="lobby">
      <div className="lobby__main">
        <h1 className="lobby__title">Are We There Yet?</h1>
        <button className="lobby__enter" onClick={onEnter}>
          Receive the Answer
        </button>
      </div>
      <footer className="vanity">
        <p>an accessible experience</p>
        <p>ICS4U 24-25 #4</p>
      </footer>
    </div>
  );
}
