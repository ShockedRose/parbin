import { lazy, Suspense } from "react"

const Design3 = lazy(() => import("@/designs/design-3"))

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

export function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Design3 />
    </Suspense>
  )
}

export default App
