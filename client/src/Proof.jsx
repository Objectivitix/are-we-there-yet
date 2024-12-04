import { useRef, useState } from "react";
import "regenerator-runtime/runtime";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import "./App.css";
import speak from "./synth";
import {
  BEGIN_NEW_NAVIGATION,
  EXIT_NAVIGATION,
  REQUEST_UPDATE,
} from "./commands";
import { LocationBias, query, Waypoint } from "./utils";

async function getUserLocation() {
  return await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
    });
  });
}

export default function Proof() {
  const [destination, setDestination] = useState(null);
  const leg = useRef(null);

  const { transcript } = useSpeechRecognition({
    commands: [
      {
        command: BEGIN_NEW_NAVIGATION,
        callback: async (dest) => {
          speak(`User has requested that we begin a new trip to: ${dest}`);
          setDestination(dest);
          await route(dest);
          sayNextStep();
          sayRouteData();
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

  async function route(dest) {
    try {
      const pos = await getUserLocation();
      const origin = Waypoint.withCoords(
        pos.coords.latitude,
        pos.coords.longitude,
      );

      let finalDest = dest ?? destination;

      let legResp = await query("get-leg", {
        origin,
        destination: Waypoint.withAddress(dest ?? destination),
      });

      if (legResp.status === 404) {
        const searchResp = await query("text-search", {
          textQuery: dest ?? destination,
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

  async function handleSubmit(evt) {
    evt.preventDefault();

    if (!destination) {
      alert("Please enter a destination.");
      speak("Please enter a destination.");
      return;
    }

    await route();
    sayNextStep();
  }

  return (
    <>
      <form className="form" onSubmit={handleSubmit}>
        <div className="field">
          <label className="field__label" htmlFor="destination">
            Destination
          </label>
          <div className="field__body">
            <input
              className="field__input"
              type="text"
              id="destination"
              value={destination ?? "Earl of March Secondary"}
              onChange={(evt) => setDestination(evt.target.value)}
            />
          </div>
        </div>
        <button type="submit" className="navigate-btn">
          Navigate
        </button>
      </form>
      <button
        onClick={() => SpeechRecognition.startListening({ continuous: true })}
      >
        Enable Voice-Ac
      </button>
      <p>{transcript}</p>
    </>
  );
}
