import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  server: { https: true },
  plugins: [react(), mkcert()],
});
