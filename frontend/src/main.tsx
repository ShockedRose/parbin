import { PostHogProvider } from "@posthog/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import "@/i18n"
import App from "./App.tsx"
import { LanguageProvider } from "@/components/language-provider.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { isPostHogEnabled, posthog } from "@/lib/posthog"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      refetchOnWindowFocus: false,
    },
  },
})

const app = (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
)

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isPostHogEnabled ? (
      <PostHogProvider client={posthog}>{app}</PostHogProvider>
    ) : (
      app
    )}
  </StrictMode>
)
