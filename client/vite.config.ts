import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0", // ✅ Listen on all IPv4 interfaces
    port: 8080,
    allowedHosts: [
      ".ngrok-free.dev",      // ✅ Allow all ngrok tunnels
      ".trycloudflare.com",   // ✅ Allow Cloudflare tunnels
      "localhost",            // ✅ Still allow local development
      "127.0.0.1",
    ],
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
