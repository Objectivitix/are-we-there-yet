import { useState } from "react";
import Lobby from "./Lobby";
import Navigation from "./Navigation";

export default function App() {
  const [inLobby, setInLobby] = useState(true);

  function handleEnter() {
    setInLobby(false);
  }

  return (
    <>
      {inLobby && <Lobby onEnter={handleEnter} />}
      {!inLobby && <Navigation />}
    </>
  );
}
