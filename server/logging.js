import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Define __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GOOGLE_DIR = path.join(__dirname, `logs/google-api-resps`);

// Date and time formatter
const DateFormatter = new Intl.DateTimeFormat("en-CA");
const TimeFormatter = new Intl.DateTimeFormat("en-CA", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export async function logGoogleResponse(apiName, responseText) {
  const now = new Date();
  const directory = path.join(GOOGLE_DIR, DateFormatter.format(now));

  // Ensure the datestamped directory exists
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  // Generate a timestamped filename
  const timestamp = TimeFormatter.format(now).replace(/:/g, "-");
  const fileName = `${apiName}-${timestamp}.json`;
  const filePath = path.join(directory, fileName);

  // Write the input string to the file
  fs.writeFileSync(filePath, responseText, "utf8");

  updateAggregateData(apiName);
}

function updateAggregateData(apiName) {
  const filePath = path.join(GOOGLE_DIR, "aggregate.json");

  let data = {};

  if (fs.existsSync(filePath)) {
    try {
      data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (error) {
      console.error(
        "Couldn't update aggregate data. Error reading aggregate.json:",
        error.message,
      );
      return;
    }
  }

  if (!data[apiName]) {
    data[apiName] = { callsN: 0 };
  }

  data[apiName].callsN += 1;

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}
