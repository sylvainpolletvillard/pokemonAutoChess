import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")

  return {
    root: "app/public",
    publicDir: false,
    plugins: [react()],
    build: {
      outDir: "dist/client",
      assetsDir: "bundles",
      emptyOutDir: false
    },
    define: {
      "process.env.FIREBASE_API_KEY": `"${env.FIREBASE_API_KEY}"`,
      "process.env.FIREBASE_AUTH_DOMAIN": `"${env.FIREBASE_AUTH_DOMAIN}"`,
      "process.env.FIREBASE_PROJECT_ID": `"${env.FIREBASE_PROJECT_ID}"`,
      "process.env.FIREBASE_STORAGE_BUCKET": `"${env.FIREBASE_STORAGE_BUCKET}"`,
      "process.env.FIREBASE_MESSAGING_SENDER_ID": `"${env.FIREBASE_MESSAGING_SENDER_ID}"`,
      "process.env.FIREBASE_APP_ID": `"${env.FIREBASE_APP_ID}"`,
      "process.env.DISCORD_SERVER": `"${env.DISCORD_SERVER}"`,
      "process.env.MIN_HUMAN_PLAYERS": `"${env.MIN_HUMAN_PLAYERS}"`
    },
    server: {
      port: 5173,
      proxy: {
        // Proxy Colyseus matchmaking and API requests to the Express/Colyseus backend
        "/matchmake": {
          target: "http://localhost:9000",
          changeOrigin: true,
          ws: true
        },
        "/api": {
          target: "http://localhost:9000",
          changeOrigin: true
        },
        "/v1": {
          target: "http://localhost:9000",
          changeOrigin: true
        }
      }
    }
  }
})
