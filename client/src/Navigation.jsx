import { useState } from "react";
import "./Navigation.css";
import Action from "./Action";
import Embed from "./Embed";
import NewDest from "./NewDest";
import test from "./assets/maneuvers/turn-right.svg";
import newDestIcon from "./assets/new-dest.svg";
import exitNavIcon from "./assets/exit-nav.svg";

export default function Navigation() {
  const [isNewDestRendered, setIsNewDestRendered] = useState(false);

  function handleNewDestSubmit(dest) {
    console.log("New destination submitted:", dest);
    setIsNewDestRendered(false);
  };

  return (
    <div className="navigation">
      <div className="curr-step">
        <div className="curr-step__maneuver">
          <img
            className="curr-step__maneuver-icon"
            src={test}
            alt="Turn Right"
          />
        </div>
        <div className="curr-step__right-side">
          <p className="curr-step__distance">1.5 km</p>
          <p className="curr-step__road">Earl Grey Dr</p>
        </div>
      </div>
      <Embed />
      <div className="trip-bar">
        <div className="trip-bar__info">
          <p className="trip-bar__distance">21 km</p>
          <p className="time-info">
            <span className="time-info__duration">30 min</span>
            <span className="time-info__separator">•</span>
            <span className="time-info__eta">15:07</span>
          </p>
        </div>
        <div className="actions">
          <Action
            iconSrc={newDestIcon}
            iconAlt="New Destination"
            onClick={() => setIsNewDestRendered(true)}
          />
          <Action
            iconSrc={exitNavIcon}
            iconAlt="Exit Navigation"
            onClick={() => console.log("exit nav clicked!")}
          />
        </div>
      </div>
      {isNewDestRendered && (
        <NewDest
          onSubmit={handleNewDestSubmit}
          onClose={() => setIsNewDestRendered(false)}
        />
      )}
    </div>
  );
}
