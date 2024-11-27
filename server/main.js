import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fetch from "node-fetch";
import { logGoogleResponse } from "./logging.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;
const ROUTES_API_URL = `https://routes.googleapis.com/directions/v2:computeRoutes?key=${API_KEY}&fields=*`;

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint to get the "route"
app.post("/api/get-leg", async (req, res) => {
  const { origin, destination } = req.body;

  if (!origin || !destination) {
    return res
      .status(400)
      .json({ message: "Both origin and destination are required." });
  }

  const payload = {
    origin: {
      location: {
        latLng: { latitude: origin.latitude, longitude: origin.longitude },
      },
    },
    destination: {
      address: destination,
    },
    travelMode: "WALK",
  };

  try {
    const response = await fetch(ROUTES_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const raw = await response.text();
    logGoogleResponse("routes", raw);

    if (!response.ok) {
      return res.status(500).json({
        message: `Server error: API call failed with status ${response.status}`,
      });
    }

    const data = JSON.parse(raw);
    const leg = data.routes?.[0].legs[0];

    if (leg === undefined) {
      return res.status(500).json({
        message: `Server error: Unable to find route (could be geocoding issue).`,
      });
    }

    console.log({ ...leg });
    res.json({ ...leg });
  } catch (error) {
    res.status(500).json({
      message: `Server error: API call threw an error. See server console.`,
    });

    console.error(error.message);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
