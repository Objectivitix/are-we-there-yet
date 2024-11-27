import { useState } from "react";
import "./App.css";

function App() {
  const [destination, setDestination] = useState(null);

  async function handleSubmit(evt) {
    evt.preventDefault();

    if (!destination) {
      alert("Please enter a destination.");
      return;
    }

    try {
      const userLocation = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const origin = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      };

      const response = await fetch("http://localhost:5504/api/get-first-step", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin,
          destination: "Earl of March Secondary",
        }),
      });

      console.log(await response.text());
    } catch (error) {
      console.error("Error:", error.message);
    }
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
              value={destination ?? ""}
              onChange={(evt) => setDestination(evt.target.value)}
            />
          </div>
        </div>
        <button type="submit" className="navigate-btn">
          Navigate
        </button>
      </form>
    </>
  );
}

export default App;
