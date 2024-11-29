import { useRef, useState } from "react";
import "regenerator-runtime/runtime";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import "./App.css";
import speak from "./synth";
import { BEGIN_NEW_NAVIGATION, EXIT_NAVIGATION, REQUEST_UPDATE } from "./commands";

async function getUserLocation() {
  const pos = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
    });
  });

  return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
}

function App() {
  const [destination, setDestination] = useState(null);
  const leg = useRef(null);

  const { transcript } = useSpeechRecognition({
    commands: [
      {
        command: BEGIN_NEW_NAVIGATION,
        callback: async (dest) => {
          speak(`User has requested that we begin a new trip to: ${dest}`);
          // setDestination(dest);
          // await route(dest);
          // sayNextStep();
          // sayRouteData();
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
      const origin = await getUserLocation();

      const response = await fetch("http://localhost:5504/api/get-leg", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin,
          destination: dest || destination,
        }),
      });

      if (!response.ok) {
        speak("Something went wrong.");
        return;
      }

      leg.current = await response.json();
    } catch (error) {
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

export default App;
