import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import mkcert from "vite-plugin-mkcert"
import { defineConfig } from "vite"

// mkcert generates a locally trusted certificate so the dev server can serve
// HTTPS. Installing that CA needs sudo/root, which is not available in every
// environment (CI, containers). Set VITE_HTTPS=false to serve plain HTTP.
const httpsEnabled = process.env.VITE_HTTPS !== "false"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), ...(httpsEnabled ? [mkcert()] : [])],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
