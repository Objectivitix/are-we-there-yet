import { useRef, useState } from "react";
import { useSpeechRecognition } from "react-speech-recognition";
import "./Navigation.css";
import Action from "./Action";
import Embed from "./Embed";
import NewDest from "./NewDest";
import { speak, cancelAllUtterances } from "./synth";
import WAKEY_WAKEY, {
  BEGIN_NEW_NAVIGATION,
  DETAILED_LOOKAHEAD,
  EXIT_NAVIGATION,
  REQUEST_HELP,
  REQUEST_UPDATE,
  textToDigit,
} from "./commands";
import { getUserLocation, query, LocationBias, Waypoint } from "./utils";
import test from "./assets/maneuvers/turn-right.svg";
import newDestIcon from "./assets/new-dest.svg";
import exitNavIcon from "./assets/exit-nav.svg";
import { HELP, NOT_ON_A_TRIP } from "./voicelines";

export default function Navigation() {
  const [isNewDestRendered, setIsNewDestRendered] = useState(false);
  const [currFinalDest, setCurrFinalDest] = useState(null);
  const leg = useRef(null);

  const { transcript } = useSpeechRecognition({
    commands: [
      {
        command: WAKEY_WAKEY,
        callback: cancelAllUtterances,
      },
      {
        command: REQUEST_HELP,
        callback: () => {
          speak(...HELP);
        },
      },
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

          if (!getIsNavigating()) {
            speak(NOT_ON_A_TRIP);
            return;
          }

          await route(currFinalDest);

          speak(
            `${getStepVoiceline()}. The step after that is. ${getStepVoiceline(1)}`,
          );
        },
      },
      {
        command: DETAILED_LOOKAHEAD,
        callback: async (num) => {
          speak(`User has requested a detailed lookahead.`);

          if (!getIsNavigating()) {
            speak(NOT_ON_A_TRIP);
            return;
          }

          await route(currFinalDest);

          const n = textToDigit(num);

          for (let i = 0; i < n - 1; i++) {
            speak(`${getStepVoiceline(i)}. After that.`);
          }

          speak(getStepVoiceline(n));
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
    setCurrFinalDest(null);
    speak("Exiting navigation.");
  }

  async function beginNewTrip(dest) {
    const finalDest = await route(dest);
    speak(`Beginning new trip to ${finalDest}.`);
    sayStep();
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
        speak("Did not receive OK response from server.");
        return;
      }

      leg.current = await legResp.json();

      setCurrFinalDest(finalDest);
      return finalDest;
    } catch (error) {
      speak("Something crashed.");
      console.error("Error:", error.message);
    }
  }

  function getIsNavigating() {
    return currFinalDest !== null;
  }

  function getStepDistanceMeters(index) {
    const step = leg.current.steps[index ?? 0];
    return step.distanceMeters;
  }

  function getStepDistance(index) {
    const step = leg.current.steps[index ?? 0];
    return step.localizedValues.distance.text;
  }

  function getStepInstruction(index) {
    const step = leg.current.steps[index ?? 0];
    return step.navigationInstruction.instructions;
  }

  function getStepRoad(index) {
    const arr = getStepInstruction(index).split(/ (?:on|onto) /);

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

  function getStepVoiceline(index) {
    return `In ${getStepDistanceMeters(index)} meters, ${getStepInstruction(index)}.`;
  }

  function sayStep(index) {
    speak(getStepVoiceline(index));
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
            <p className="curr-step__distance">{getStepDistance()}</p>
            <p className="curr-step__road">{getStepRoad()}</p>
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
