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
        callback: exitNavigation,
      },
    ],
  });

  async function handleNewDestSubmit(dest) {
    setIsNewDestRendered(false);
    await beginNewTrip(dest);
  }

  function exitNavigation() {
    leg.current = null;
    speak("Exiting navigation.");
  }

  async function beginNewTrip(dest) {
    await route(dest);
    sayCurrStep();
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

      leg.current = await legResp.json();
      speak(`Beginning new trip to ${finalDest}.`);
    } catch (error) {
      speak("Something went wrong.");
      console.error("Error:", error.message);
    }
  }

  function getIsNavigating() {
    return leg.current !== null;
  }

  function getCurrStepDistanceMeters() {
    const step = leg.current.steps[0];
    return step.distanceMeters;
  }

  function getCurrStepDistance() {
    const step = leg.current.steps[0];
    return step.localizedValues.distance.text;
  }

  function getCurrStepInstruction() {
    const step = leg.current.steps[0];
    return step.navigationInstruction.instructions;
  }

  function getCurrStepRoad() {
    const arr = getCurrStepInstruction().split(/ (?:on|onto) /);

    if (arr.length === 0) return "";
    return arr[arr.length - 1];
  }

  function getRouteDistanceMeters() {
    return leg.current.distanceMeters;
  }

  function getRouteDistance() {
    return leg.current.localizedValues.distance.text;
  }

  function getRouteSpokenDuration() {
    const seconds = parseInt(leg.current.duration);
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minutes`;
  }

  function getRouteDuration() {
    return leg.current.localizedValues.duration.text;
  }

  function getRouteETA() {
    const seconds = parseInt(leg.current.duration);

    const currentTime = new Date();
    const arrivalTime = new Date(currentTime.getTime() + seconds * 1000);

    return arrivalTime.toTimeString().slice(0, 5); // Returns "HH:MM"
  }

  function sayCurrStep() {
    speak(
      `In ${getCurrStepDistanceMeters()} meters, ${getCurrStepInstruction()}.`,
    );
  }

  function sayRouteData() {
    speak(
      `${getRouteDistanceMeters()} more total meters to go. Estimated time: ${getRouteSpokenDuration()}.`,
    );
  }

  return (
    <div className="navigation">
      {getIsNavigating() && (
        <div className="curr-step">
          <div className="curr-step__maneuver">
            <img
              className="curr-step__maneuver-icon"
              src={test}
              alt="Turn Right"
            />
          </div>
          <div className="curr-step__right-side">
            <p className="curr-step__distance">{getCurrStepDistance()}</p>
            <p className="curr-step__road">{getCurrStepRoad()}</p>
          </div>
        </div>
      )}
      <Embed />
      <div className="trip-bar">
        {getIsNavigating() && (
          <div className="trip-bar__info">
            <p className="trip-bar__distance">{getRouteDistance()}</p>
            <p className="time-info">
              <span className="time-info__duration">{getRouteDuration()}</span>
              <span className="time-info__separator">•</span>
              <span className="time-info__eta">{getRouteETA()}</span>
            </p>
          </div>
        )}
        <div className="actions">
          <Action
            iconSrc={newDestIcon}
            iconAlt="New Destination"
            onClick={() => setIsNewDestRendered(true)}
          />
          <Action
            iconSrc={exitNavIcon}
            iconAlt="Exit Navigation"
            onClick={exitNavigation}
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
