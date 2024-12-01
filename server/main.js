import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { getLeg, textSearch } from "./api.js";

dotenv.config();

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

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
