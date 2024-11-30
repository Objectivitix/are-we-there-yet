import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Define __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function logGoogleResponse(apiName, responseText) {
  const directory = path.join(__dirname, "logs/google-api-resps");

  // Ensure the directory exists
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  // Generate a timestamped filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `${apiName}-${timestamp}.json`;
  const filePath = path.join(directory, fileName);

  // Write the input string to the file
  fs.writeFileSync(filePath, responseText, "utf8");

  updateAggregateData(directory, apiName);
}

function updateAggregateData(directory, apiName) {
  const filePath = path.join(directory, "aggregate.json");

  let data = { [apiName]: { callsN: 1 } };

  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, "utf8");
      data = JSON.parse(raw);
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
