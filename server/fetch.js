import fs from "fs";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import { logGoogleResponse } from "./logging.js";

// Define __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async (googleURL, apiName, payload, mockRelativePath) => {
  if (mockRelativePath) {
    const mockPath = path.join(__dirname, mockRelativePath);

    if (fs.existsSync(mockPath)) {
      console.log(`${apiName}: Mock response used from ${mockRelativePath}.`);

      return {
        response: { status: 200, ok: true },
        data: JSON.parse(fs.readFileSync(mockPath)),
      };
    }
  }

  const response = await fetch(googleURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const raw = await response.text();
  logGoogleResponse(apiName, raw);

  const data = JSON.parse(raw);

  return { response, data };
};
