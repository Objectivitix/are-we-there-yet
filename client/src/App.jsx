import { useRef, useState } from "react";
import "regenerator-runtime/runtime";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import "./App.css";
import speak from "./synth";

async function getUserLocation() {
  const pos = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
    });
  });

  return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
}

function getVoiceline(step) {
  return `In ${step.distanceMeters} meters, ${step.navigationInstruction.instructions}.`;
}

function App() {
  const [destination, setDestination] = useState(null);
  const leg = useRef(null);

  const { transcript } = useSpeechRecognition({
    commands: [
      {
        command: "Hey Map direct me to *",
        callback: async (dest) => {
          setDestination(dest);
          await route(dest);
          sayNextStep();
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
    speak(getVoiceline(leg.current.steps[0]));
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
      <button onClick={() => SpeechRecognition.startListening({ continuous: true })}>Enable Voice-Ac</button>
      <p>{transcript}</p>
    </>
  );
}

export default App;
