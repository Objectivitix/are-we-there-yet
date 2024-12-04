import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import https from "https";
import os from "os";
import { getLeg, textSearch } from "./api.js";

dotenv.config();

// Get the private LAN address dynamically
const localIPAddress = (() => {
  const interfaces = os.networkInterfaces();
  for (const interfaceDetails of Object.values(interfaces)) {
    for (const detail of interfaceDetails) {
      if (detail.family === "IPv4" && !detail.internal) {
        return detail.address;
      }
    }
  }

  // Fallback to quad 0 if no LAN address is found
  return "0.0.0.0";
})();

const args = process.argv.slice(2);

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

const SEARCH_FIELDS = [
  "nextPageToken",
  "places.id",
  // "places.accessibilityOptions",
  // "places.addressComponents",
  // "places.adrFormatAddress",
  // "places.businessStatus",
  // "places.containingPlaces",
  // "places.displayName",
  // "places.formattedAddress",
  // "places.googleMapsLinks",
  // "places.googleMapsUri",
  // // "places.iconBackgroundColor",
  // // "places.iconMaskBaseUri",
  // "places.location",
  // // "places.photos",
  // "places.plusCode",
  // "places.primaryType",
  // "places.primaryTypeDisplayName",
  // "places.pureServiceAreaBusiness",
  // "places.shortFormattedAddress",
  // "places.subDestinations",
  // "places.types",
  // "places.utcOffsetMinutes",
  // "places.viewport",
];

const ROUTES_URL = `https://routes.googleapis.com/directions/v2:computeRoutes?key=${API_KEY}&fields=*`;
const SEARCH_URL = `https://places.googleapis.com/v1/places:searchText?key=${API_KEY}&fields=${SEARCH_FIELDS.join(",")}`;

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint to get the "route"
app.post("/api/get-leg", getLeg(ROUTES_URL));

// Endpoint for ambiguous, free-form text search
app.post("/api/text-search", textSearch(SEARCH_URL));

let server = app;
let isHttps = args.includes("--https");

if (isHttps) {
  const key = fs.readFileSync(`${localIPAddress}-key.pem`, "utf-8");
  const cert = fs.readFileSync(`${localIPAddress}.pem`, "utf-8");

  server = https.createServer({ key, cert }, app);
}

// Start the server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on ${isHttps ? "https" : "http"}://${localIPAddress}:${PORT}`);
});
