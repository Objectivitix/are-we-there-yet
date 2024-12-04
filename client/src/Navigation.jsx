import { useRef, useState } from "react";
import { useSpeechRecognition } from "react-speech-recognition";
import "./Navigation.css";
import Action from "./Action";
import Embed from "./Embed";
import NewDest from "./NewDest";
import speak from "./synth";
import {
  BEGIN_NEW_NAVIGATION,
  EXIT_NAVIGATION,
  REQUEST_UPDATE,
} from "./commands";
import { getUserLocation, query, LocationBias, Waypoint } from "./utils";
import test from "./assets/maneuvers/turn-right.svg";
import newDestIcon from "./assets/new-dest.svg";
import exitNavIcon from "./assets/exit-nav.svg";

export default function Navigation() {
  const [isNewDestRendered, setIsNewDestRendered] = useState(false);
  const leg = useRef(null);

  const { transcript } = useSpeechRecognition({
    commands: [
      {
        command: BEGIN_NEW_NAVIGATION,
        callback: async (dest) => {
          speak(`User has requested that we begin a new trip to: ${dest}`);
          await beginNewTrip(dest);
        },
      },
      {
        command: REQUEST_UPDATE,
        callback: async () => {
          speak("User has requested a navigation update.");
        },
      },
      {
        command: EXIT_NAVIGATION,
        callback: () => {
          leg.current = null;
          speak("Exiting navigation.");
        },
      },
    ],
  });

  async function handleNewDestSubmit(dest) {
    setIsNewDestRendered(false);
    await beginNewTrip(dest);
  };

  async function beginNewTrip(dest) {
    await route(dest);
    sayNextStep();
    sayRouteData();
  }

  async function route(dest) {
    try {
      const pos = await getUserLocation();
      const origin = Waypoint.withCoords(
        pos.coords.latitude,
        pos.coords.longitude,
      );

      let finalDest = dest;

      let legResp = await query("get-leg", {
        origin,
        destination: Waypoint.withAddress(dest),
      });

      if (legResp.status === 404) {
        const searchResp = await query("text-search", {
          textQuery: dest,
          locationBias: LocationBias(
            pos.coords.latitude,
            pos.coords.longitude,
            1000,
          ),
        });

        const {
          name,
          shortFormattedAddress,
          location: { latitude, longitude },
        } = await searchResp.json();

        finalDest = `${name}, ${shortFormattedAddress}`;

        legResp = await query("get-leg", {
          origin,
          destination: Waypoint.withCoords(latitude, longitude),
        });
      }

      if (!legResp.ok) {
        speak("Something went wrong.");
        return;
      }

      speak(`Beginning new trip to ${finalDest}.`);
      leg.current = await legResp.json();
    } catch (error) {
      speak("Something went wrong.");
      console.error("Error:", error.message);
    }
  }

  function sayNextStep() {
    const step = leg.current.steps[0];
    speak(
      `In ${step.distanceMeters} meters, ${step.navigationInstruction.instructions}.`,
    );
  }

  function sayRouteData() {
    speak(
      `${leg.current.distanceMeters} more total meters to go. Estimated time: ${leg.current.duration}.`,
    );
  }

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
