import fetch from "node-fetch";
import { logGoogleResponse } from "./logging.js";

export function getLeg(googleURL) {
  return (req, res) => _getLeg(req, res, googleURL);
}

export function textSearch(googleURL) {
  return (req, res) => _textSearch(req, res, googleURL);
}

async function _getLeg(req, res, googleURL) {
  const { origin, destination } = req.body;

  if (!origin || !destination) {
    return res
      .status(400)
      .json({ message: "Both origin and destination are required." });
  }

  const payload = {
    origin,
    destination,
    travelMode: "WALK",
  };

  try {
    const response = await fetch(googleURL, {
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
    console.log(data.geocodingResults);

    if (data.geocodingResults.destination?.geocoderStatus.code === 5) {
      return res.status(404).json({
        message: `Destination could not be geocoded. Try invoking text-search first.`,
      });
    }

    const leg = data.routes?.[0].legs[0];
    res.json({ ...leg });
  } catch (error) {
    res.status(500).json({
      message: `Server error: API call or data parsing threw an error. See server console.`,
    });

    throw error;
    // console.error(error.message);
  }
}

async function _textSearch(req, res, googleURL) {
  const { textQuery, locationBias } = req.body;

  if (!textQuery || !locationBias) {
    return res
      .status(400)
      .json({ message: "Both textQuery and locationBias are required." });
  }

  const payload = {
    textQuery,
    locationBias,
  };

  try {
    const response = await fetch(googleURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const raw = await response.text();
    logGoogleResponse("text-search", raw);

    if (!response.ok) {
      return res.status(500).json({
        message: `Server error: API call failed with status ${response.status}`,
      });
    }

    const data = JSON.parse(raw);
    const {
      displayName: { text: name },
      shortFormattedAddress,
      location,
    } = data.places[0];

    res.json({ name, shortFormattedAddress, location });
  } catch (error) {
    res.status(500).json({
      message: `Server error: API call or data parsing threw an error. See server console.`,
    });

    console.error(error.message);
  }
}
