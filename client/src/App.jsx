import { useState } from "react";
import "regenerator-runtime/runtime";
import SpeechRecognition from "react-speech-recognition";
import Lobby from "./Lobby";
import Navigation from "./Navigation";
import speak from "./synth";
import { HELLO } from "./voicelines";

export default function App() {
  const [inLobby, setInLobby] = useState(true);

  function handleEnter() {
    setInLobby(false);
    SpeechRecognition.startListening({ continuous: true });
    speak(HELLO);
  }

  return (
    <>
      {inLobby && <Lobby onEnter={handleEnter} />}
      {!inLobby && <Navigation />}
    </>
  );
}
