import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Define __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function logGoogleResponse(apiName, responseText) {
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
}
